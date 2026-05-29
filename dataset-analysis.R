#install.packages(c("tidyverse", "leaflet", "tidygeocoder", "scales", "htmlwidgets", "lubridate", "httr2))

library(tidyverse)
library(leaflet)        # nice to see this also exists in r, love this library when doing web
library(tidygeocoder)   # proved quite useful
library(scales)         # used in the map for the marker sizes
library(htmlwidgets)    # read about this and wanted to experiment with saving this as an html file
library(lubridate)      
library(httr2)          # http requests to exchange API
library(jsonlite)


# =========== Setup of data ===========
dataset <- read_csv(
  "/Users/valeryivanov/Desktop/IMC Krems/Data Analysis/data-analysis-deliverable/data/sales_data_sample.csv",
  locale = locale(encoding = "latin1")
)

apac_dataset <- read_csv(
  "/Users/valeryivanov/Desktop/IMC Krems/Data Analysis/data-analysis-deliverable/data/apac_countries.csv"
)

apac_countries <- apac_dataset$Country

dataset <- dataset %>% 
  mutate(
    TERRITORY = if_else(COUNTRY %in% apac_countries,               "APAC", TERRITORY),
    TERRITORY = if_else(COUNTRY %in% c("USA", "Canada", "Mexico"), "NA", TERRITORY)
  )


# we get all countries so we can map them out
unique(dataset$COUNTRY)


# Country -> local currency
# Countries already using EUR are mapped to EUR.
country_currency <- tribble(
  ~COUNTRY,        ~currency,
  "Canada",       "CAD", # start of NA
  "USA",          "USD",
  "Mexico",       "MXN",
  "Ireland",      "EUR", # start of EMEA
  "France",       "EUR",
  "Finland",      "EUR",
  "Austria",      "EUR",
  "Spain",        "EUR",
  "Italy",        "EUR",  
  "Belgium",      "EUR",
  "Germany",      "EUR",
  "Norway",       "NOK",
  "Denmark",      "DKK",
  "UK",           "GBP",
  "Switzerland",  "CHF",
  "Sweden",       "SEK",
  "Australia",    "AUD", # start of APAC
  "Japan",        "JPY",
  "Singapore",    "SGD",
  "Philippines",  "PHP"
)


# =========== API currency conversions ===========

# Did this to get the rate for 1 unit of local currency in EUR
# For example: USD -> EUR means 1 USD = x EUR
# solution: total_USD * exchange_rate = total_EUR
get_rate_to_eur <- function(date, currency) {
  if (is.na(date) || is.na(currency)) return(NA_real_)
  if (currency == "EUR") return(1)
  
  date_str <- format(as.Date(date), "%Y-%m-%d")
  
  url <- paste0(
    "https://api.frankfurter.dev/v2/rate/",
    currency, "/EUR",
    "?date=", date_str
  )
  
  tryCatch({
    response <- request(url) %>%
      req_perform() %>%
      resp_body_json()
    
    rate <- response$rate
    
    if (is.null(rate) || length(rate) != 1) {
      warning("No single rate found for ", currency, " on ", date_str)
      return(NA_real_)
    }
    
    as.numeric(rate)
    
  }, error = function(e) {
    warning("API error for ", currency, " on ", date_str, ": ", e$message)
    return(NA_real_)
  })
}


# Parse order dates and attach currency
dataset_with_currency <- dataset %>%
  mutate(
    order_date = as_date(parse_date_time(
      ORDERDATE,
      orders = c("mdy HMS", "mdy", "ymd HMS", "ymd")
    ))
  ) %>%
  left_join(country_currency, by = "COUNTRY")


# Parse dates and attach currency
dataset_with_currency <- dataset2 %>%
  mutate(
    order_date = as_date(parse_date_time(
      ORDERDATE,
      orders = c("mdy HMS", "mdy", "ymd HMS", "ymd")
    ))
  ) %>%
  left_join(country_currency, by = "COUNTRY")


# Get one historical exchange rate per date/currency combination
historical_rates <- dataset_with_currency %>%
  distinct(order_date, currency) %>%
  mutate(
    exchange_rate_to_eur = map2_dbl(order_date, currency, function(d, c) {
      Sys.sleep(0.05)  # gentle rate-limiting for the api calls
      get_rate_to_eur(d, c)
    })
  )


# Get today's exchange rate per currency for popup display
today_rates <- dataset_with_currency %>%
  distinct(currency) %>%
  mutate(
    today_exchange_rate_to_eur = map_dbl(currency, ~ get_rate_to_eur(Sys.Date(), .x))
  )


# Add EUR sales to the original dataset
dataset_eur <- dataset_with_currency %>%
  left_join(historical_rates, by = c("order_date", "currency")) %>%
  left_join(today_rates, by = "currency") %>%
  mutate(
    # Used historical rate as a fallback to today's rate if it is missing
    effective_rate = coalesce(exchange_rate_to_eur, today_exchange_rate_to_eur),
    sales_eur = SALES * effective_rate
  )


# =========== end of API-related tasks | start of main piping operations ===========


# A small chain of piping operations to get sales by location
# most important step here is basically that we decided to remove the NA values from the dataset and work from there
sales_by_location <- dataset_eur %>%
  group_by(CITY, COUNTRY, TERRITORY, currency, today_exchange_rate_to_eur) %>%
  summarise(
    total_sales_eur   = sum(sales_eur, na.rm = TRUE),
    total_quantity    = sum(QUANTITYORDERED, na.rm = TRUE),
    number_of_orders  = n_distinct(ORDERNUMBER),
    product_lines     = paste(unique(PRODUCTLINE), collapse = ", "),
    .groups = "drop"
  ) %>%
  mutate(
    location = paste(CITY, COUNTRY, sep = ", ")
  )


# =========== Placing points in locations by address ===========
# This renders all of the geolocation data on the map and creates markers via colored bubbles

sales_geocoded <- sales_by_location %>%
  geocode(address = location, method = "osm", lat = latitude, long = longitude) %>%
  filter(!is.na(latitude), !is.na(longitude)) %>%
    mutate(
      bubble_size = rescale(total_sales_eur, to = c(4, 25))
    )

# =========== Rendering of the map ===========
# defining the palette that will be used
# saw online that there are sets, so we tried it out
pal <- colorFactor(palette = "Set2", domain = sales_geocoded$TERRITORY)

sales_map <- leaflet(sales_geocoded) %>%
  addProviderTiles(providers$Esri.WorldStreetMap) %>%
  addCircleMarkers( # just refer to the documentation for this one, it is pretty simple from there.
    lng = ~longitude,
    lat = ~latitude,
    radius = ~bubble_size,
    color = ~pal(TERRITORY),
    fillColor = ~pal(TERRITORY),
    fillOpacity = 0.75,
    stroke = FALSE,
    
    #this will probably go, but I felt smart doing this inside of a paste (and it actually worked)
    popup = ~paste0(
      "<strong>", CITY, ", ", COUNTRY, "</strong><br>",
      "Territory: ", TERRITORY, "<br>",
      "Total sales: €", comma(round(total_sales_eur, 2)), "<br>",
      "Today's rate: 1 ", currency, " = €", round(today_exchange_rate_to_eur, 4), "<br>",
      "Quantity ordered: ", comma(total_quantity), "<br>",
      "Number of orders: ", number_of_orders, "<br>",
      "Product lines: ", product_lines
    )
  ) %>%
  addLegend(
    position = "bottomright",
    pal = pal,
    values = ~TERRITORY, # using sales_geocoded$TERRITORY would yield the same results, but isn't as tidy
    title = "Territory"
  )


# Visualising the final map
sales_map


# Saving as a file still hasn't come in as useful

# TODO: maybe look into passing these as JSON values to the web? or maybe just read CSV directly?
# would defeat the point of using R, but maybe there's a way to map all of this onto a three.js globe
saveWidget(sales_map, "sales_leaflet_map.html", selfcontained = TRUE)


sales_geocoded %>%
  select(CITY, COUNTRY, TERRITORY, currency, latitude, longitude,
         total_sales_eur, total_quantity, number_of_orders, product_lines) %>%
  toJSON(pretty = TRUE) %>%
  write("sales_data.json")

