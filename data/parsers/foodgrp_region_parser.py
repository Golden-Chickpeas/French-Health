# NAME
#        foodgrp_region_parser
#
# DESCRIPTION
#
#       'foodgrp_region_parser' is a script that returns one csv per foodgroup consummed
#       (see codgr) in each region
#       We first retrieve all individuals in a given region and then, for each foodgrp (1 to 44)
#      we extract from CONSO table the matching data
#
# HISTORY
#
# 2 january 2018 - Initial design and coding. (Valentina Zelaya, @vz-chameleon)

import pandas as pd
import numpy as np

data_url_conso='../raw/INCA2/Table_conso.csv'
df_conso=pd.read_csv(data_url_conso, sep = ';')

for reg_code in (1,21):
    data_url_indiv_region='../csv/indiv_by_region/indiv_per_region_'+str(reg_code)+'.csv'
    df_indiv_reg=pd.read_csv(data_url_indiv_region, sep = ';')

    # Get all the individuals in the loaded region
    indiv_values_list = df_indiv_reg["nomen"].values
    indiv_list = np.unique(indiv_values_list)


    #For each food group code (see codgr in field description of INCA2 Data)
    for ind in range(1,45):
        c=df_conso.loc[(df_conso['codgr'] == ind) & (df_conso['nomen'].isin(indiv_list))]
        file_name='../csv/conso_per_region/region'+str(reg_code)+'/full_conso_of_codgr_'+str(ind)+'_region_'+str(reg_code)+'.csv'
        c.to_csv(file_name, sep=';')
