# NAME
#        repas_region_parser
#
# DESCRIPTION
#
#       'repas_region_parser' is a script that returns one csv per day of the week
#       (see nojour) in each region
#       We first retrieve all individuals in a given region and then, for each nojour (1 to 7)
#      we extract from REPAS table the matching data
#
# HISTORY
#
# 2 january 2018 - Initial design and coding. (Valentina Zelaya, @vz-chameleon, TGarwood @TGarwood)

import pandas as pd
import numpy as np
import os.path

data_url_repas='../raw/INCA2/Table_repas.csv'
df_repas=pd.read_csv(data_url_repas, sep = ';')

for reg_code in range(1,22):
    data_url_indiv_region='../csv/indiv_by_region/indiv_per_region_'+str(reg_code)+'.csv'
    df_indiv_reg=pd.read_csv(data_url_indiv_region, sep = ';')

    # Get all the individuals in the loaded region
    indiv_values_list = df_indiv_reg["nomen"].values
    indiv_list = np.unique(indiv_values_list)


    #For each day code (see nojour in field description of INCA2 Data)
    for nojour in range(1,8):
        c=df_repas.loc[(df_repas['nojour'] == nojour) & (df_repas['nomen'].isin(indiv_list))]
        file_path = os.path.join('..','csv','repas_by_region','region'+str(reg_code))
        file_name = 'full_repas_of_nojour_'+str(nojour)+'_region_'+str(reg_code)+'.csv'
        if not os.path.exists(file_path):
            os.makedirs(file_path)
        c.to_csv(os.path.join(file_path,file_name), sep=';')
