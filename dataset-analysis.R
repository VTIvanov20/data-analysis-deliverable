#install.packages(c("tidyverse", "leaflet", "tidygeocoder", "scales", "htmlwidgets"))

library(tidyverse)
library(leaflet)        # nice to see this is also in r
library(tidygeocoder)   # proved quite useful
library(scales)
library(htmlwidgets)    # read about this and wanted to experiment with saving this as an html file

dataset <- read_csv(
  "/Users/valeryivanov/Desktop/IMC Krems/Data Analysis/data-analysis-deliverable/sales_data_sample.csv",
  locale = locale(encoding = "latin1")
)

# A small chain of piping operations to get only sales by location
# most important step here is basically that we decided to remove the NA values from the dataset and work from there
sales_by_location <- dataset %>%
  group_by(CITY, COUNTRY, TERRITORY) %>%
  summarise(
    total_sales = sum(SALES, na.rm = TRUE),
    total_quantity = sum(QUANTITYORDERED, na.rm = TRUE),
    number_of_orders = n_distinct(ORDERNUMBER),
    product_lines = paste(unique(PRODUCTLINE), collapse = ", "),
    .groups = "drop"
  ) %>%
  mutate(
    location = paste(CITY, COUNTRY, sep = ", ")
  )

sales_geocoded <- sales_geocoded %>%
  mutate(
    bubble_size = rescale(total_sales, to = c(4, 25))
  )

# defining the palette that will be used
# saw online that there are sets, so we tried it out
pal <- colorFactor(
  palette = "Set2",
  domain = sales_geocoded$TERRITORY
)

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
      "Total sales: $", comma(round(total_sales, 2)), "<br>",
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

sales_map

# Saving as a file still hasn't come in as useful

# TODO: maybe look into passing these as JSON values to the web? or maybe just read CSV directly?
# would defeat the point of using R, but maybe there's a way to map all of this onto a three.js globe
saveWidget(
  sales_map,
  "sales_leaflet_map.html",
  selfcontained = TRUE
)