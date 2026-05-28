library(tidyverse)
library(readr)

# This is done by hand, as there aren't that many columns and the business case of deliveries is relatively straightforward.
# The snippet allows us to see which countries use states
#   as we found out, optional fields are TERRITORY and ADDRESSLINE2, but STATE is most-likely case-dependant of COUNTRY.
#   let's check that:

country_states <- read_csv(
  "/Users/valeryivanov/Desktop/IMC Krems/Data Analysis/data-analysis-deliverable/sales_data_sample.csv",
  locale = locale(encoding = "latin1")
)

country_states <- country_states %>% 
  select(COUNTRY, STATE) %>% 
  filter(!is.na(STATE))

sort(unique(country_states$COUNTRY))

View(country_states)


# Alternatively, one could make a script to calculate a percentage of NA values. 
# If the count passess a % of missing values set by us, we can deduce that the field was optional for the user.

## A Simple algorithm for this would be:
# Run is.na() as a part of a pipe for the dataset and choose which col to analyse
# Get the total length of all entries and the count of NA values 
# Calculate % by: percent_na = (NA * 100) / nrow(.)
# if(percent_na >= 55) -> value was optional for the user
