library(tidyverse)
library(readr)

fields <- read_csv(
  "/Users/valeryivanov/Desktop/IMC Krems/Data Analysis/data-analysis-deliverable/sales_data_sample.csv",
  locale = locale(encoding = "latin1")
)

# ========= Optional fields ==========

optional_fields_df <- tibble(
  Field_names = c("TERRITORY", "STATE", "ADDRESSLINE2"), # ordered by descending for how specific the location is
  Is_mandatory = FALSE
)

# ========= Mandatory fields ==========

mandatory_fields_raw <- fields %>% 
  select(everything(), -c(TERRITORY, STATE, ADDRESSLINE2)) # exclude these

mandatory_fields_df <- data.frame(
  Field_names = colnames(mandatory_fields_raw),
  Is_mandatory = TRUE
)
mandatory_fields_df

# ========= Join of Tables fields ==========
# we chose a full join, due to the entries of both df-s obviously not matching

field_is_mandatory_lookup <- full_join(
  mandatory_fields_df,
  optional_fields_df
)


