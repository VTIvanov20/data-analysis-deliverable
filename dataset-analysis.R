#install.packages(c("tidyverse", "leaflet", "tidygeocoder", "scales"))

library(tidyverse)
library(leaflet)        # nice to see this is also in r
library(tidygeocoder)   # proved quite useful
library(scales)

dataset <- read_csv(
  "/Users/valeryivanov/Desktop/IMC Krems/Data Analysis/data-analysis-deliverable/sales_data_sample.csv",
  locale = locale(encoding = "latin1")
)

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

sales_geocoded <- sales_geocoded %>%
  mutate(
    bubble_size = rescale(total_sales, to = c(4, 25))
  )

pal <- colorFactor(
  palette = "Set2",
  domain = sales_geocoded$TERRITORY
)

sales_map <- leaflet(sales_geocoded) %>%
  addProviderTiles(providers$CartoDB.DarkMatter) %>%
  addCircleMarkers(
    lng = ~longitude,
    lat = ~latitude,
    radius = ~bubble_size,
    color = ~pal(TERRITORY),
    fillColor = ~pal(TERRITORY),
    fillOpacity = 0.75,
    stroke = FALSE,
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
    values = ~TERRITORY,
    title = "Territory"
  )

sales_map