from optimizer.models import *
from .optimizerbase import OptimizerBase


class DailyMasterOptimizer(OptimizerBase):

    def run(self, optmizertask_id):

        OptimizerBase.util_start_optimizer(self, __name__, optmizertask_id)

        # get optimizer object
        opt_obj = OptimizerBase.get_optimizer(self, optmizertask_id)

        # get energy unit object
        energyunit = OptimizerBase.get_energyunit(self, opt_obj)

        # influx series name
        series_name = energyunit.influxKey

        # fetch data
        data = OptimizerBase.get_series_data(self, series_name)

        # convert Unix time to datetime

        #get info from OptimizerTask
        config = OptimizerBase.utils_extract_config(self, optmizertask_id)
        context = OptimizerBase.utils_extract_context(self, optmizertask_id)

        #writing back some result from function to Optimizer Task context.
        returning_variable_from_function = {
            "block1":
                {"variable1": [1, 2, 3]
                }
        }

        #updating context of the task
        task = OptimizerTask.objects.get(id=optmizertask_id)
        task.context = returning_variable_from_function
        task.save(update_fields=['context',])


def run(optmizertask_id):

    daily_opt = DailyMasterOptimizer()

    daily_opt.run(optmizertask_id)