// create population of num size
//    create num individuals of length size
//      create array of random numbers between 0-1, of length size

//  advance population
//    decode genome
//    score genomes
//    sort genomes
//    kill x num individuals
//    repopulate x num individuals with y chance to mutate
//      pick 2 random parents
//      zip genes, with y chance to mutate on each choice

// advance population x num times

const _ = require('lodash');

const { Question } = require('../../db/index');

const log4js = require('log4js');

log4js.configure({
  appenders: { algorithms: { type: 'file', filename: 'algorithms.log' } },
  categories: { default: { appenders: ['algorithms'], level: 'debug' } },
});

const log = log4js.getLogger('questionMap');

const tournament3 = (population) => {
  const n = population.length;
  const a = population[Math.floor(Math.random() * n)];
  const b = population[Math.floor(Math.random() * n)];
  const c = population[Math.floor(Math.random() * n)];
  let best = a.score > b.score ? a : b;
  best = best.score > c.score ? best : c;
  return best;
};

const mate = (mom, dad, mutChance) => {
  const full = _.zip(mom.genome, dad.genome);
  return { genome: full.map(gene => (Math.random() < mutChance ? Math.random() : gene[Math.round(Math.random())])) };
};

const decodeGenome = (genome, encodingScheme) => {
  const population = [...genome];
  return encodingScheme(population);
};

const scoreGenome = (decodedGenome, questionData, scoringScheme) => {
  const population = [...decodedGenome];
  return scoringScheme(population, questionData);
};

const calculateDistance = (gene1, gene2, q1) => {
  const gene2Id = gene2._id.toString();

  const gene1Index = gene1.index + 1;
  const gene2Index = gene2.index + 1;


  if (!q1.data[gene1Index] || !q1.data[gene1Index][gene2Id] || !q1.data[gene1Index][gene2Id][gene2Index]) {
    return 10;
  }

  const q1Total = _.values(q1.data[gene1Index][gene2Id]).reduce((tot, num) => tot + num, 0);

  const q1Num = q1.data[gene1Index][gene2Id][gene2Index];

  const q1Score = q1Num / q1Total;

  return (1 - q1Score);
};

const createFinal = (encodedGenome, questionData) => encodedGenome.map((gene1, index, arr) => {
  const gene2 = arr[index + 1];
  const gene3 = arr[index + 2];
  const gene4 = arr[index - 1];
  const gene6 = arr[index + 3];
  const gene7 = arr[index - 3];
  const gene8 = arr[index + 4];
  const gene9 = arr[index - 4];
  const gene10 = arr[index + 5];
  const gene11 = arr[index - 5];
  const gene5 = arr[index - 2];

  if (arr[index + 1] &&
    gene2 &&
    gene3 &&
    gene6 &&
    gene7 &&
    gene8 &&
    gene9 &&
    gene10 &&
    gene11 &&
    gene4 && gene5) {
    const q1 = questionData[gene1._id];


    const distance = calculateDistance(gene1, gene2, q1) +
    calculateDistance(gene1, gene3, q1) +
    calculateDistance(gene1, gene4, q1) +
    calculateDistance(gene1, gene5, q1) +
    calculateDistance(gene1, gene6, q1) +
    calculateDistance(gene1, gene7, q1) +
    calculateDistance(gene1, gene8, q1) +
    calculateDistance(gene1, gene9, q1) +
    calculateDistance(gene1, gene10, q1) +
    calculateDistance(gene1, gene11, q1);

    const stdDev = Math.sqrt((calculateDistance(gene1, gene2, q1) ** 2 +
    calculateDistance(gene1, gene3, q1) ** 2 +
    calculateDistance(gene1, gene4, q1) ** 2 +
    calculateDistance(gene1, gene5, q1) ** 2 +
    calculateDistance(gene1, gene6, q1) ** 2 +
    calculateDistance(gene1, gene7, q1) ** 2 +
    calculateDistance(gene1, gene8, q1) ** 2 +
    calculateDistance(gene1, gene9, q1) ** 2 +
    calculateDistance(gene1, gene10, q1) ** 2 +
    calculateDistance(gene1, gene11, q1) ** 2) / 9);

    return [gene1, distance, stdDev];
  }
  return [gene1];
}, 0);

class EncodingScheme {
  constructor(populationData) {
    this.populationData = populationData;
    this.default = this.default.bind(this);
  }
  default(population) {
    return population.map(({ genome }) => {
      const zippedData = _.zip(this.populationData, genome);
      const sortedData = zippedData.sort(([, aScore], [, bScore]) => aScore - bScore);
      const finalData = sortedData.map(([individual]) => individual);
      return { genome, encodedGenome: finalData };
    });
  }
}

class KillingScheme {
  default(population) {
    population.pop();
    return population;
  }
}

class ScoringScheme {
  default(population, questionData) {
    return population.map((individual) => {
      const { genome, encodedGenome } = individual;
      const score = individual.encodedGenome.reduce((total, gene1, index, arr) => {
        const gene2 = arr[index + 1];
        const gene3 = arr[index + 2];
        const gene4 = arr[index - 1];
        const gene6 = arr[index + 3];
        const gene7 = arr[index - 3];
        const gene8 = arr[index + 4];
        const gene9 = arr[index - 4];
        const gene10 = arr[index + 5];
        const gene11 = arr[index - 5];
        const gene5 = arr[index - 2];

        if (arr[index + 1] &&
          gene2 &&
          gene3 &&
          gene6 &&
          gene7 &&
          gene8 &&
          gene9 &&
          gene10 &&
          gene11 &&
          gene4 && gene5) {
          const q1 = questionData[gene1._id];


          // const distance = calculateDistance(gene1, gene2, q1) +
          // calculateDistance(gene1, gene3, q1) +
          // calculateDistance(gene1, gene4, q1) +
          // calculateDistance(gene1, gene5, q1) +
          // calculateDistance(gene1, gene6, q1) +
          // calculateDistance(gene1, gene7, q1) +
          // calculateDistance(gene1, gene8, q1) +
          // calculateDistance(gene1, gene9, q1) +
          // calculateDistance(gene1, gene10, q1) +
          // calculateDistance(gene1, gene11, q1);
          const stdDev = Math.sqrt((calculateDistance(gene1, gene2, q1) ** 2 +
          calculateDistance(gene1, gene3, q1) ** 2 +
          calculateDistance(gene1, gene4, q1) ** 2 +
          calculateDistance(gene1, gene5, q1) ** 2 +
          calculateDistance(gene1, gene6, q1) ** 2 +
          calculateDistance(gene1, gene7, q1) ** 2 +
          calculateDistance(gene1, gene8, q1) ** 2 +
          calculateDistance(gene1, gene9, q1) ** 2 +
          calculateDistance(gene1, gene10, q1) ** 2 +
          calculateDistance(gene1, gene11, q1) ** 2) / 9);
          return total + stdDev;
        }
        return total;
      }, 0);
      return { genome, encodedGenome, score };
    });
  }
}

class SortingScheme {
  default(population) {
    return population.sort((a, b) => a.score - b.score);
  }
}

class MatingScheme {
  default(population, numToKill, mutChance, questionData, encodingScheme, scoringScheme) {
    const newPopulation = [...population];
    const newMembers = [];
    for (let i = 0; i < numToKill; i++) {
      const mom = tournament3(population);
      const dad = tournament3(population);
      newMembers.push(mate(mom, dad, mutChance));
    }
    const encodedNewMembers = decodeGenome(newMembers, encodingScheme);
    const scoredNewMembers = scoreGenome(encodedNewMembers, questionData, scoringScheme);
    return newPopulation.concat(scoredNewMembers);
  }
}

const newIndividual = {
  default: (individualSize) => {
    const genome = [];
    for (let i = 0; i < individualSize; i++) {
      genome.push(Math.random());
    }
    return { genome };
  },
};


const sortGenome = (scoredGenome, sortingScheme) => {
  const population = [...scoredGenome];
  return sortingScheme(population);
};


const thinPopulation = (sortedGenome, numToKill, killingScheme) => {
  let population = [...sortedGenome];
  for (let i = 0; i < numToKill; i++) {
    population = killingScheme(population);
  }
  return population;
};

const repopulate = (thinnedPopulation, numToKill, mutChance, questionData, matingScheme, scoringScheme, encodingScheme) => {
  const population = [...thinnedPopulation];
  return matingScheme(population, numToKill, mutChance, questionData, encodingScheme, scoringScheme);
};

const createPopulation = (numIndividuals, individualSize, type = 'default') => {
  const population = [];
  for (let i = 0; i < numIndividuals; i++) {
    population.push(newIndividual[type](individualSize));
  }
  return population;
};

const advancePopulation = (population, questionData, { numIterations = 20000, mutChance = 0.05, numToKill = 50, matingScheme, sortingScheme, scoringScheme, killingScheme, encodingScheme }) => {
  let currentPopulation = [...population];
  const decodedGenome = decodeGenome(currentPopulation, encodingScheme);
  currentPopulation = scoreGenome(decodedGenome, questionData, scoringScheme);
  for (let i = 0; i < numIterations; i++) {
    const sortedGenome = sortGenome(currentPopulation, sortingScheme);
    const thinnedPopulation = thinPopulation(sortedGenome, numToKill, killingScheme);
    log.info(currentPopulation[0].score);
    currentPopulation = repopulate(thinnedPopulation, numToKill, mutChance, questionData, matingScheme, scoringScheme, encodingScheme);
  }
  return createFinal(currentPopulation[0].encodedGenome, questionData);
};


Question.aggregate([
  {
    $match: { seen: { $gt: 500 } },
  },
  {
    $project: { answersArray: ['$qans1', '$qans2', '$qans3', '$qans4'] },
  },
  {
    $unwind: {
      path: '$answersArray',
      includeArrayIndex: 'index',
    },
  },
  {
    $match: { answersArray: { $ne: '' } },
  },
  {
    $project: { index: 1 },
  },
]).exec((err, questions) => {
  if (err) { log.error(err); }
  Question.find({ seen: { $gt: 500 } }).select('_id data qans1 qans2 qans3 qans4 qtext').lean(true).exec((err, detailedQuestions) => {
    if (err) { log.error(err); }
    const questionsById = _.keyBy(detailedQuestions, '_id');
    const encodingScheme = new EncodingScheme(questions).default;
    const scoringScheme = new ScoringScheme().default;
    const matingScheme = new MatingScheme().default;
    const sortingScheme = new SortingScheme().default;
    const killingScheme = new KillingScheme().default;
    const population = createPopulation(500, questions.length);

    const topPopulation = advancePopulation(population, questionsById, {
      encodingScheme,
      scoringScheme,
      killingScheme,
      sortingScheme,
      matingScheme,
    });
    log.info('-----------------------');
    log.info('-----------------------');
    log.info('-----------------------');
    log.info(`std-dev for population: ${Math.sqrt(topPopulation.reduce((total, [, score]) => (score ? total + (score ** 2) : total), 0) / topPopulation.length)}`);
    topPopulation.forEach(([ind, score, stdDev]) => log.info(`score: ${Math.round(score * 100) / 100} stdDev: ${stdDev} id: ${ind._id} answer: ${ind.index + 1} ${questionsById[ind._id].qtext} ${questionsById[ind._id][`qans${ind.index + 1}`]}`));
    log.info('-----------------------');
    log.info('-----------------------');
    log.info('-----------------------');
  });
});

