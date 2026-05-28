library(tidyverse)
library(readr)

dataset <- read_csv(
  "/Users/valeryivanov/Desktop/IMC Krems/Data Analysis/data-analysis-deliverable/sales_data_sample.csv",
  locale = locale(encoding = "latin1")
  )

addressline2_updated <- dataset %>%
  mutate(
    ADDRESSLINE2_raw = ADDRESSLINE2,
    
    address_type = case_when(
      is.na(ADDRESSLINE2) ~ NA_character_,
      str_detect(str_to_lower(ADDRESSLINE2), "level|floor") ~ "level",
      str_detect(str_to_lower(ADDRESSLINE2), "suite") ~ "suite",
      
      TRUE ~ "other" #putting this here just as a fallback condition
    ),
    
    level_number = case_when(
      is.na(ADDRESSLINE2) ~ NA_integer_,
      str_detect(str_to_lower(ADDRESSLINE2), "level|floor") ~
        as.integer(str_extract(ADDRESSLINE2, "\\d+")),
      
      TRUE ~ NA_integer_ #also a fallback
    ),
    
    suite_number = case_when(
      str_detect(str_to_lower(ADDRESSLINE2), "suite") ~
        str_extract(ADDRESSLINE2, "\\d+"),
      
      TRUE ~ NA_character_ #also a fallback
    ),
    
    ADDRESSLINE2_normalised = case_when(
      is.na(ADDRESSLINE2) ~ NA_character_,
      address_type == "level" ~ paste("Level", level_number),
      address_type == "suite" ~ paste("Suite", suite_number),
      
      TRUE ~ ADDRESSLINE2 #also a fallback
    )
  )

addressline2_updated %>%
  distinct(ADDRESSLINE2_raw, ADDRESSLINE2_normalised, address_type, level_number, suite_number)

unique(dataset$PRODUCTLINE)
View(dataset)








