class Project {
	constructor(name) {
		this.name = name;
		this.cost;
		this.categories = [];
	}
}

class Category {
	constructor(name) {
		this.name = name;
		this.risks = [];
	}
}

class Risk {
	constructor(name) {
		this.name = name;
		this.weight = 0;
		this.occurance = 0;
		this.coefficient = 0;
		this.controllability = 0;
		this.dependency = 0;
	}
}
