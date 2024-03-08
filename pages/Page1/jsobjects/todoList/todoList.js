export default {
	listState: 'today',
	setListState: (listState) => {
		this.listState = listState
	},

	selectedTask: undefined,
	setSelectedTask: (task) => {
		this.selectedTask = task
	},

	currentTasks: () => {
		if (this.listState === 'today') {
			return this.getTodaysTasks.data
		}
		if (this.listState === 'pending') {
			return this.getPendingTasks.data
		}
		if (this.listState === 'overtime') {
			return this.getOvertimeTasks.data
		}
		return this.getCompletedTasks.data
	},

	getTodaysTasks: async () => {
		const allTasks = await getAllTasks.run()
		const todaysTasks = allTasks.filter((task) => moment(task.created_at).isSame(new Date(), "day"))
		const incompleteTasks = todaysTasks.filter((t) => t.is_complete === false)
		incompleteTasks.sort((a, b) => b.created_at.localeCompare(a.created_at))
		return incompleteTasks
	},

	getPendingTasks: async () => {
		const allTasks = await getAllTasks.run()
		const pendingTasks = allTasks.filter((task) => !task.is_complete)
		const incompletePendingTasks = pendingTasks.filter((t) => t.is_complete === false)
		incompletePendingTasks.sort((a, b) => a.id - b.id)
		return incompletePendingTasks
	},

	getCompletedTasks: async () => {
		const allTasks = await getAllTasks.run()
		const completedTasks = allTasks.filter((task) => task.is_complete)
		completedTasks.sort((a, b) => b.id - a.id)
		return completedTasks
	},

	getOvertimeTasks: async () => {
		const allTasks = await getAllTasks.run()
		const today = new Date().toISOString().slice(0, 10) // Extract YYYY-MM-DD part
		const overdueTasks = allTasks.filter((task) => task.deadline < today)

		const incompleteOverdueTasks = overdueTasks.filter((t) => t.is_complete === false)

		incompleteOverdueTasks.sort((a, b) => a.id - b.id)
		return incompleteOverdueTasks
	},

	updateAllTasks: async () => {
		await this.getTodaysTasks()
		await this.getPendingTasks()
		await this.getCompletedTasks()
		await this.getOvertimeTasks()
	},

	addTask: async () => {
		if (!Form.data.formTaskDeadline || !Form.data.formTaskPriority || !Form.data.formTaskTitle) {
			showAlert('Invalid Form', 'error')
			return
		}

		try {
			const result = await addTask.run()
			console.log('addTask', result)
			await this.updateAllTasks()
			closeModal('taskDetail')
			resetWidget('Form')
			showAlert('Task Created!', 'success')
		} catch (error) {
			showAlert('FAIL!', 'error')
			console.error('add Task', error)
		}
	},

	updateTask: async () => {
		if (!Form.data.formTaskDeadline || !Form.data.formTaskPriority || !Form.data.formTaskTitle) {
			showAlert('Invalid Form', 'error')
			return
		}
		try {
			const result = await updateTask.run()
			console.log('updateTask', result)
			await this.updateAllTasks()

			resetWidget('Form')
			closeModal('taskDetail')
			showAlert('Task Updated!', 'success')
		} catch (error) {
			showAlert('FAIL!', 'error')
			console.error('update Task', error)
		}
	},
	
	toggleCompleteStatus: async (task) => {
		try {
			this.selectedTask = task
			await toggleCompleteTask.run()
			todoList.updateAllTasks()
			this.selectedTask = undefined
			showAlert('Task Status Updated!', 'success');
     } catch(error) {
			showAlert('FAIL!', 'error')
			console.error('toggleCompleteStatus', error)
    }
	}
}