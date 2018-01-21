# coding: cp1252
# NAME
#        fplate-composition_per_region
#
# DESCRIPTION
#
#       'plate-composition_per_region' is a parser script for getting the compositions of
#       plates in each type of meal ( 1 : Petit dejeuner, 3 :Dejeuner, 5 : Diner)
#
# HISTORY
#
# 21 january 2018 - Initial design and coding. (Valeentina Zelaya, @vz-chameleon)

import pandas as pd
import numpy as np
import os.path
import json

data_url_conso='../raw/INCA2/Table_conso.csv'
df_conso=pd.read_csv(data_url_conso, sep = ';')

# Interesting fields : codgr	libgr	sougr	libsougr	codal	libal
data_url_nomenclature='../raw/INCA2/Nomenclature_3.csv'
df_nomenclature=pd.read_csv(data_url_nomenclature, sep = ';',encoding='cp1252')

for reg_code in range(1,22):
    data_url_indiv_region='../csv/indiv_by_region/indiv_per_region_'+str(reg_code)+'.csv'
    df_indiv_reg=pd.read_csv(data_url_indiv_region, sep = ';')

    # Get all the individuals in the loaded region
    indiv_values_list = df_indiv_reg["nomen"].values
    indiv_list = np.unique(indiv_values_list)

    # For each type of meal...
    for type_repas in (1,3,5):
        df_tyrep = df_conso.loc[(df_conso['tyrep'] == type_repas) & (df_conso['nomen'].isin(indiv_list))]

        # JSON for hierarchy...
        data = {}
        if type_repas == 1 :
            data["name"] = "petit-déjeuner"
        elif type_repas == 3 :
            data["name"] = "déjeuner"
        else :
            data["name"] = "dîner"

        foodgrp_list = []
        #For each food group code (see codgr in field description of INCA2 Data)
        for foodgrp in range(1,40)+range(41,45):
            df_fdrp = df_tyrep.loc[(df_tyrep["codgr"]==foodgrp)]
            # Interesting fields : codgr;sougr;codal
            hierarchy_foogrp_region = df_nomenclature.loc[(df_nomenclature['codgr'] == foodgrp)]

            # print(foodgrp)
            foodgrp_dict= {}
            grp_name=hierarchy_foogrp_region['libgr'].iloc[0]
            foodgrp_dict["name"]=grp_name

            foodsougrp_list=[]
            for foodsougrp in np.unique(df_fdrp["sougr"].values):
                foodsougrp_dict={}
                # print('sousgrp'+str(foodsougrp))
                sougrp_region=hierarchy_foogrp_region.loc[(hierarchy_foogrp_region['sougr'] == foodsougrp)]
                sougrp_name=sougrp_region['libsougr'].iloc[0]
                foodsougrp_dict["name"]=sougrp_name

                # print(sougrp_name)
                sougrp_conso=df_fdrp.loc[(df_fdrp['sougr'] == foodsougrp)]
                # print(df_fdrp)
                # print(sougrp_conso)
                conso_list=[]
                for codal in np.unique(sougrp_conso['codal'].values):
                    # print(codal)
                    conso_codal={}
                    codal_region=sougrp_region.loc[(sougrp_region['codal'] == codal)]
                    # print(codal_region)
                    codal_name=codal_region['libal'].iloc[0]
                    conso_codal["name"]=codal_name

                    c=sougrp_conso.loc[(sougrp_conso['codal'] == codal)]
                    conso_codal["size"]=c.qte_brute.mean()
                    conso_list.append(conso_codal)

                    foodsougrp_dict["children"]=conso_list
                foodsougrp_list.append(foodsougrp_dict)

            foodgrp_dict["children"]=foodsougrp_list
            # Append the food grp and it's children to list of sousgrps
            foodgrp_list.append(foodgrp_dict)

        data["children"] = foodgrp_list

        file_path = os.path.join('..', 'json', 'meal_compositions','region'+str(reg_code))
        file_name = 'meal_'+str(type_repas)+'_composition_region_'+str(reg_code)+'.json'
        if not os.path.exists(file_path):
            os.makedirs(file_path)

        with open(os.path.join(file_path,file_name), 'w') as json_file:
            json.dump(data, json_file, encoding='cp1252')
