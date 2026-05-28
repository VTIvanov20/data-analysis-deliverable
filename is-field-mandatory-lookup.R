library(tidyverse)
library(readr)

fields <- read_csv(
  "/Users/valeryivanov/Desktop/IMC Krems/Data Analysis/data-analysis-deliverable/sales_data_sample.csv",
  locale = locale(encoding = "latin1")
)

optional_fields_df <- tibble(
  Field_names = c("TERRITORY", "STATE", "ADDRESSLINE2"),
  Is_mandatory = FALSE
)

mandatory_fields_raw <- fields %>% 
  select(everything(), -c(TERRITORY, STATE, ADDRESSLINE2)) 

mandatory_fields_df <- data.frame(
  Field_names = colnames(mandatory_fields_raw),
  Is_mandatory = TRUE
)
mandatory_fields_df


field_is_mandatory_lookup <- full_join(
  mandatory_fields_df,
  optional_fields_df
)


