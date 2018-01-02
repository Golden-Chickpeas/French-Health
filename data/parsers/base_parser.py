import pandas as pd
import numpy as np

# TODO :  change to take it as command argument
dataurl='../raw/INCA2/Table_indiv.csv'

data_tab=pd.read_csv(dataurl, sep = ';')

print(data_tab.info())
print(data_tab.columns)

## What is the poids of the individual that goes the most to fastfood restau ?
c = data_tab.groupby('fastfood')
c = c.sum()
c = c.sort_values(['poids'], ascending=False)
print(c.head(1)) # individual
print(c.head(1)['poids'])
