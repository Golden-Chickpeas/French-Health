# NAME
#        foodgrp_mean_parser
#
# DESCRIPTION
#
#       'foodgrp_mean_parser' is a script that returns one csv per foodgroup consummed
#       (see codgr) containing the mean consumption of a the given foodgroup in all regions
#       We first retrieve all individuals in a given region and then, for each foodgrp (1 to 44)
#       we extract from CONSO table the matching data
#
# HISTORY
#
# 2 january 2018 - Initial design and coding. (Valentina Zelaya, @vz-chameleon)

import pandas as pd
import numpy as np

data_url_conso='../raw/INCA2/Table_conso.csv'
df_conso=pd.read_csv(data_url_conso, sep = ';')

region_codes_url='../csv/indiv_by_region/region_codes.csv'
df_regions=pd.read_csv(region_codes_url, sep= ';')

mean_qte_brute_by_region = [None]*21
entries_number_region= [None]*21
indiv_number_for_region = [None]*21

#For each food group code (see codgr in field description of INCA2 Data)
for ind in range(1,45):
    for reg_code in range(1,22):
        data_url_indiv_region='../csv/indiv_by_region/indiv_per_region_'+str(reg_code)+'.csv'
        df_indiv_reg=pd.read_csv(data_url_indiv_region, sep = ';')

        # Get all the individuals in the loaded region
        indiv_values_list = df_indiv_reg["nomen"].values
        indiv_list = np.unique(indiv_values_list)
        indiv_number_for_region[reg_code-1]=len(indiv_list)

        # Getting consumption data for individuals in given region
        c=df_conso.loc[(df_conso['codgr'] == ind) & (df_conso['nomen'].isin(indiv_list))]
        entries_number_region[reg_code-1]=len(c['qte_brute'].values)

        mean_qte_brute_by_region[reg_code-1]=c.qte_brute.mean()
        # print(reg_code)
        # print(mean_qte_brute_by_region)

    df_regions['entries_num']=entries_number_region
    df_regions['indiv_num']=indiv_number_for_region
    df_regions['mean_qte_brute']=mean_qte_brute_by_region

    file_name='../csv/foodgrp_conso_means/conso_of_codgr_'+str(ind)+'.csv'
    df_regions.to_csv(file_name, sep=';')
