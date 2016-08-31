def run(optmizertask):
    try:
        toImp = "alert.subalerts"
        filename = optmizertask.task_type.filename;
        fromlist = optmizertask.task_type.classname;
        AlertClasses = __import__(str(toImp + "." + filename), globals(), locals(), [fromlist], -1)
        klass = getattr(AlertClasses, fromlist);
        task = klass(optmizertask);
        task.runTask();
    except Exception as e:
        pass
