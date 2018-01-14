# coding: iso-8859-1
# NAME
#        conso-hierarchy_week
#
# DESCRIPTION
#
#       'conso-hierarchy_week' is a script that returns one json file per week
#       (see nojour) in each region for each food group
#
# HISTORY
#
# 12 january 2018 - Initial design and coding. (Valentina Zelaya, @vz-chameleon, TGarwood @TGarwood)

import pandas as pd
import numpy as np
import os.path
import json

# Interesting fields : codgr	libgr	sougr	libsougr	codal	libal
data_url_nomenclature='../raw/INCA2/Nomenclature_3.csv'
df_nomenclature=pd.read_csv(data_url_nomenclature, sep = ';',encoding='cp1252')

for reg in range(1,22):
    for foodgrp in range(1,45):
        data_url_consoreg='../csv/conso_per_region/region'+str(reg)+'/full_conso_of_codgr_'+str(foodgrp)+'_region_'+str(reg)+'.csv'
        df_consoreg=pd.read_csv(data_url_consoreg, sep = ';')

        # Interesting fields : codgr;sougr;codal
        hierarchy_foogrp_region = df_nomenclature.loc[(df_nomenclature['codgr'] == foodgrp)]

        # JSON for partition is simpler than JSON for hierarchy :)
        data = {}

        foodsougrp_dict={}
        foodgrp_name=""
        for foodsougrp in np.unique(df_consoreg["sougr"].values):

            sougrp_region=hierarchy_foogrp_region.loc[(hierarchy_foogrp_region['sougr'] == foodsougrp)]
            sougrp_name=sougrp_region['libsougr'].iloc[0]
            foodgrp_name=sougrp_region['libgr'].iloc[0]

            sougrp_conso=df_consoreg.loc[(df_consoreg['sougr'] == foodsougrp)]
            conso_codal={}
            for codal in np.unique(sougrp_conso['codal'].values):
                codal_region=sougrp_region.loc[(sougrp_region['codal'] == codal)]
                codal_name=codal_region['libal'].iloc[0]

                c=sougrp_conso.loc[(sougrp_conso['codal'] == codal)]
                conso_codal[codal_name]=c.qte_brute.mean()


            foodsougrp_dict[sougrp_name]=conso_codal

        data[foodgrp_name] =  foodsougrp_dict


        file_path = os.path.join('..', 'json', 'foodgrp_conso_partition','region'+str(reg))
        file_name = 'consos_partition_'+str(foodgrp)+'_region_'+str(reg)+'.json'
        if not os.path.exists(file_path):
            os.makedirs(file_path)

        with open(os.path.join(file_path,file_name), 'w') as json_file:
            json.dump(data, json_file, encoding='cp1252')
            # print(data)
