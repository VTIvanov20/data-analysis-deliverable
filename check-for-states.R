library(tidyverse)
library(readr)

country_states <- read_csv(
  "/Users/valeryivanov/Desktop/IMC Krems/Data Analysis/data-analysis-deliverable/sales_data_sample.csv",
  locale = locale(encoding = "latin1")
)

country_states <- country_states %>% 
  select(COUNTRY, STATE) %>% 
  filter(!is.na(STATE))

sort(unique(country_states$COUNTRY))

View(country_states)