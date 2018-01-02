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
import os

data_url_menage='../raw/INCA2/Table_menage_1.csv'

df_menage=pd.read_csv(data_url_menage, sep = ';')

for reg_code in range(1,22):
    data_url_indiv_region='../csv/indiv_by_region/indiv_per_region_'+str(reg_code)+'.csv'
    df_indiv_reg=pd.read_csv(data_url_indiv_region, sep = ';')

    # Get all the individuals in the loaded region
    indiv_values_list = df_indiv_reg["nomen"].values
    indiv_list = np.unique(indiv_values_list)


    c=df_menage.loc[(df_menage['nomen'].isin(indiv_list))]
    file_path = os.path.join('..','csv','menage_by_region')
    file_name = 'menage_by_region'+str(reg_code)+'.csv'
    if not os.path.exists(file_path):
        os.makedirs(file_path)
    c.to_csv(os.path.join(file_path,file_name), sep=';')
