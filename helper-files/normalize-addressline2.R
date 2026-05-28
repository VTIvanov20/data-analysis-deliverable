library(tidyverse)
library(readr)

# This is made to normalize the ADDRESSLINE2 entries.

dataset_for_helpers <- read_csv(
  "/Users/valeryivanov/Desktop/IMC Krems/Data Analysis/data-analysis-deliverable/sales_data_sample.csv",
  locale = locale(encoding = "latin1")
)

addressline2_updated <- dataset_for_helpers %>%
  mutate(
    ADDRESSLINE2_raw = ADDRESSLINE2,
    
    # we found out there are constants for different NAs (character, integer, etc) and used them here
    # also learned about the tilde operator, which is used to specify relationships like so:
    # dependant_variables ~ independent_variables
    
    address_type = case_when(
      is.na(ADDRESSLINE2) ~ NA_character_,
      str_detect(str_to_lower(ADDRESSLINE2), "level|floor") ~ "level",
      str_detect(str_to_lower(ADDRESSLINE2), "suite") ~ "suite",
      
      TRUE ~ "other" # putting this here just as a fallback condition
    ),
    
    # something similar is done here, but this time there's also a check for numbers right after that
    # here we're looking for a correlation between line 31 and 32 by using the ~ operator as described above
    level_number = case_when(
      is.na(ADDRESSLINE2) ~ NA_integer_,
      str_detect(str_to_lower(ADDRESSLINE2), "level|floor") ~
        as.integer(str_extract(ADDRESSLINE2, "\\d+")), # regex for finding one or more digits in a row
      
      TRUE ~ NA_integer_ # also a fallback
    ),
    
    suite_number = case_when(
      str_detect(str_to_lower(ADDRESSLINE2), "suite") ~
        str_extract(ADDRESSLINE2, "\\d+"), # the same regex (regular expression)
      
      TRUE ~ NA_character_ # also a fallback
    ),
    
    ADDRESSLINE2_normalised = case_when(
      is.na(ADDRESSLINE2) ~ NA_character_,
      address_type == "level" ~ paste("Level", level_number),
      address_type == "suite" ~ paste("Suite", suite_number),
      
      TRUE ~ ADDRESSLINE2 # also a fallback
    )
  )

# we keept the values separate in order to clearly see the differences in the entries
addressline2_updated %>%
  distinct(ADDRESSLINE2_raw, ADDRESSLINE2_normalised, address_type, level_number, suite_number)


