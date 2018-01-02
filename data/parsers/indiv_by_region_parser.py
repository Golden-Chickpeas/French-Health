# NAME
#        indiv_by_region_parser
#
# DESCRIPTION
#
#       'indiv_by_region_parser' is a script that returns one csv per French region
#       with all individuals of that region
#
# HISTORY
#
# 2 january 2018 - Initial design and coding. (Valentina Zelaya, @vz-chameleon)

import pandas as pd
import numpy as np

data_url_indiv='../raw/INCA2/Table_indiv.csv'

df_indiv=pd.read_csv(data_url_indiv, sep = ';')

region_values_list = df_indiv["region"].values
region_list = np.unique(region_values_list)

for reg in region_list :
    c=df_indiv.loc[df_indiv['region'] == reg]
    file_name='../csv/indiv_by_region/indiv_per_region_'+str(reg)+'.csv'
    c.to_csv(file_name, sep=';')
