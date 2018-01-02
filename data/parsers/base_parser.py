import pandas as pd
import numpy as np

# TODO :  change to take it as command argument
data_url_indiv='../raw/INCA2/Table_indiv.csv'
data_url_conso='../raw/INCA2/Table_conso.csv'

data_tab_indiv=pd.read_csv(data_url_indiv, sep = ';')
data_tab_conso=pd.read_csv(data_url_conso, sep = ';')

# print(data_tab_indiv.info())
# print(data_tab_indiv.columns)

## What is the poids of the individual that goes the most to fastfood restau ?
# c = data_tab_indiv.groupby('fastfood')
# c = c.sum()
# c = c.sort_values(['poids'], ascending=False)
# print(c.head(1)) # individual
# print(c.head(1)['poids'])

# print(data_tab_conso.columns)


## --  getting all alimentation groups (see 'codgr' in description) and global
# --- statistics for each region

#For each group code
for ind in range(1,45):
    c=data_tab_conso.loc[data_tab_conso['codgr'] == ind]
    file_name='test/parsed_'+str(ind)+'_conso.csv'
    c.to_csv(file_name, sep='\t')
