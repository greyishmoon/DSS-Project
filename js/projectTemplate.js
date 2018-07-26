var project = {
	name: "name",			// string - project name
	cost: 60000,			// int - project cost in £
	categories: [],			// array of categories
	percentages: []
}

var category = {
	name: "name",
	risks: []
}

var risk = {
	name: "name",
	weight: 0,				// 0 - 1
	occurance: 0,			// 0 - 1
	coefficient: 0,			// 0 - 1
	controllability: 0,		// 0 - 1
	dependency: 0			// 0 - 1

}
