class Problem {
	constructor(title) {
		this.title = title;
		this.alternatives = [];
		this.factors = [];
	}
}

class Factor {
	constructor(name) {
		this.name = name;
		this.criteria = [];
	}
}

class Criterion {
	constructor(name) {
		this.name = name;
		this.weight = 0;
		this.alternativeWeights = [];
	}
}

//var project = new Project();
