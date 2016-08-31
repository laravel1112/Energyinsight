# -*- coding: utf-8 -*-
# from optimizer.algorithm.lighting import *
# from optimizer.algorithm.hvac import *
# from optimizer.algorithm.disaggregation import *
# from optimizer.algorithm.test import *
from data_factory_test import test_data_factory

def run(optmizertask_id):

	#lighting_opt = LightingOptimizer(optmizertask_id)

	#lighting_opt.dailypatterncheck()

	#hvac_opt = HvacOptimizer(optmizertask_id)

	#hvac_opt.dailymatchcheck()

	try:
		print('start')
		#disaggregation_opt = Disaggregation(optmizertask_id)
		#print(optmizertask_id)
		
		#disaggregation_opt.dailydisaggregation()
		if not OptimizerTask.objects.get(id = optimizertask_id).disable_datafactory:
			debug = False
			test_data_factory(optmizertask_id,debug = debug,start_time = None,end_time =None)
	except:
		print('error')
		pass
