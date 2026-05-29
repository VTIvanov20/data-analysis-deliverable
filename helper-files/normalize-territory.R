library(tidyverse)

# Data cleanup for TERRITORY
# !! IMPORTANT: make sure to run the lines below ONLY AFTER the dataset has been initialized in the main file !!
# We did this to take advantage of RStudio's environment, so you there's no need to call functions from separate files.

# made a small dataset with all the countries in the APAC region
# used for reference as seen below:
apac_dataset <- read_csv(
  "/Users/valeryivanov/Desktop/IMC Krems/Data Analysis/data-analysis-deliverable/data/apac_countries.csv",
)

# I had previously done this with just filtering, but forgot that all other entries would get overriden, thus leaving only APAC
apac_countries <- apac_dataset$Country

dataset <- dataset %>% 
  mutate(
    TERRITORY = if_else(
      COUNTRY %in% apac_countries,
      "APAC",
      TERRITORY
    )
  )

# check 1:
unique(dataset$TERRITORY) # this should return: NA, "EMEA", "APAC"


dataset <- dataset %>% 
  mutate(
    TERRITORY = if_else(
      COUNTRY %in% c("USA", "Canada", "Mexico"),
      "NA",
      TERRITORY
    )
  )

# check 2:
unique(dataset$TERRITORY) # this should return: "NA", "EMEA", "APAC"


# for convenience again:
# View(dataset)