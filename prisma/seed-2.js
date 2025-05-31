"use strict";
var __awaiter =
  (this && this.__awaiter) ||
  function (thisArg, _arguments, P, generator) {
    function adopt(value) {
      return value instanceof P
        ? value
        : new P(function (resolve) {
            resolve(value);
          });
    }
    return new (P || (P = Promise))(function (resolve, reject) {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }
      function rejected(value) {
        try {
          step(generator["throw"](value));
        } catch (e) {
          reject(e);
        }
      }
      function step(result) {
        result.done
          ? resolve(result.value)
          : adopt(result.value).then(fulfilled, rejected);
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  };
var __generator =
  (this && this.__generator) ||
  function (thisArg, body) {
    var _ = {
        label: 0,
        sent: function () {
          if (t[0] & 1) throw t[1];
          return t[1];
        },
        trys: [],
        ops: [],
      },
      f,
      y,
      t,
      g = Object.create(
        (typeof Iterator === "function" ? Iterator : Object).prototype
      );
    return (
      (g.next = verb(0)),
      (g["throw"] = verb(1)),
      (g["return"] = verb(2)),
      typeof Symbol === "function" &&
        (g[Symbol.iterator] = function () {
          return this;
        }),
      g
    );
    function verb(n) {
      return function (v) {
        return step([n, v]);
      };
    }
    function step(op) {
      if (f) throw new TypeError("Generator is already executing.");
      while ((g && ((g = 0), op[0] && (_ = 0)), _))
        try {
          if (
            ((f = 1),
            y &&
              (t =
                op[0] & 2
                  ? y["return"]
                  : op[0]
                  ? y["throw"] || ((t = y["return"]) && t.call(y), 0)
                  : y.next) &&
              !(t = t.call(y, op[1])).done)
          )
            return t;
          if (((y = 0), t)) op = [op[0] & 2, t.value];
          switch (op[0]) {
            case 0:
            case 1:
              t = op;
              break;
            case 4:
              _.label++;
              return { value: op[1], done: false };
            case 5:
              _.label++;
              y = op[1];
              op = [0];
              continue;
            case 7:
              op = _.ops.pop();
              _.trys.pop();
              continue;
            default:
              if (
                !((t = _.trys), (t = t.length > 0 && t[t.length - 1])) &&
                (op[0] === 6 || op[0] === 2)
              ) {
                _ = 0;
                continue;
              }
              if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) {
                _.label = op[1];
                break;
              }
              if (op[0] === 6 && _.label < t[1]) {
                _.label = t[1];
                t = op;
                break;
              }
              if (t && _.label < t[2]) {
                _.label = t[2];
                _.ops.push(op);
                break;
              }
              if (t[2]) _.ops.pop();
              _.trys.pop();
              continue;
          }
          op = body.call(thisArg, _);
        } catch (e) {
          op = [6, e];
          y = 0;
        } finally {
          f = t = 0;
        }
      if (op[0] & 5) throw op[1];
      return { value: op[0] ? op[1] : void 0, done: true };
    }
  };
Object.defineProperty(exports, "__esModule", { value: true });
var client_1 = require("@prisma/client");
var prisma = new client_1.PrismaClient();
var subjectsData = [
  {
    subject_name: "Mathematics",
    topics: [
      {
        topic_name: "Algebra",
        subtopics: [
          "Linear Equations",
          "Quadratic Equations",
          "Polynomials",
          "Factorization",
          "Inequalities",
          "Sequences",
          "Binomial Theorem",
          "Matrices",
          "Determinants",
          "Complex Numbers",
        ],
      },
      {
        topic_name: "Geometry",
        subtopics: [
          "Triangles",
          "Circles",
          "Angles",
          "Lines and Segments",
          "Coordinate Geometry",
          "Congruence",
          "Similarity",
          "Geometric Proofs",
          "Constructions",
          "3D Geometry",
        ],
      },
      {
        topic_name: "Trigonometry",
        subtopics: [
          "Ratios",
          "Identities",
          "Equations",
          "Applications",
          "Graphs",
          "Heights & Distances",
          "Inverse Functions",
          "Angles",
          "Units",
          "Calculations",
        ],
      },
      {
        topic_name: "Calculus",
        subtopics: [
          "Limits",
          "Derivatives",
          "Integrals",
          "Differentiation",
          "Applications",
          "Definite Integrals",
          "Indefinite Integrals",
          "Continuity",
          "Differential Equations",
          "Maxima-Minima",
        ],
      },
      {
        topic_name: "Probability",
        subtopics: [
          "Events",
          "Permutations",
          "Combinations",
          "Theorems",
          "Random Variables",
          "Distributions",
          "Bayes Theorem",
          "Tree Diagrams",
          "Expected Value",
          "Odds",
        ],
      },
      {
        topic_name: "Statistics",
        subtopics: [
          "Mean",
          "Median",
          "Mode",
          "Standard Deviation",
          "Variance",
          "Data Representation",
          "Histograms",
          "Pie Charts",
          "Scatter Plots",
          "Box Plots",
        ],
      },
      {
        topic_name: "Number Systems",
        subtopics: [
          "Natural Numbers",
          "Integers",
          "Rational Numbers",
          "Irrational Numbers",
          "Real Numbers",
          "Prime Numbers",
          "Divisibility",
          "Modulus",
          "Base Systems",
          "HCF/LCM",
        ],
      },
      {
        topic_name: "Mensuration",
        subtopics: [
          "Area",
          "Perimeter",
          "Volume",
          "Surface Area",
          "Cylinders",
          "Cones",
          "Spheres",
          "Prisms",
          "Pyramids",
          "Units",
        ],
      },
      {
        topic_name: "Sets",
        subtopics: [
          "Union",
          "Intersection",
          "Subsets",
          "Complements",
          "Venn Diagrams",
          "Power Set",
          "Empty Set",
          "Universal Set",
          "Set Builder Form",
          "Cardinality",
        ],
      },
      {
        topic_name: "Logic",
        subtopics: [
          "Statements",
          "Truth Tables",
          "Logical Operators",
          "Implications",
          "Equivalence",
          "Propositions",
          "Quantifiers",
          "Negation",
          "Arguments",
          "Contrapositive",
        ],
      },
    ],
  },
  {
    subject_name: "Physics",
    topics: [
      {
        topic_name: "Motion",
        subtopics: [
          "Speed",
          "Velocity",
          "Acceleration",
          "Graphs",
          "Laws of Motion",
          "Inertia",
          "Force",
          "Newton’s Laws",
          "Momentum",
          "Displacement",
        ],
      },
      {
        topic_name: "Work and Energy",
        subtopics: [
          "Kinetic Energy",
          "Potential Energy",
          "Work",
          "Power",
          "Units",
          "Formulas",
          "Applications",
          "Machines",
          "Heat",
          "Conservation",
        ],
      },
      {
        topic_name: "Gravitation",
        subtopics: [
          "Gravity",
          "Laws",
          "Mass & Weight",
          "Orbits",
          "Satellites",
          "Free Fall",
          "Escape Velocity",
          "Tides",
          "Center of Gravity",
          "Gravitational Field",
        ],
      },
      {
        topic_name: "Light",
        subtopics: [
          "Reflection",
          "Refraction",
          "Lenses",
          "Mirrors",
          "Optical Instruments",
          "Dispersion",
          "Color",
          "Laser",
          "Image Formation",
          "Human Eye",
        ],
      },
      {
        topic_name: "Electricity",
        subtopics: [
          "Current",
          "Voltage",
          "Resistance",
          "Ohm’s Law",
          "Series Circuits",
          "Parallel Circuits",
          "Power",
          "Energy",
          "EMF",
          "Capacitance",
        ],
      },
      {
        topic_name: "Magnetism",
        subtopics: [
          "Magnets",
          "Poles",
          "Magnetic Fields",
          "Electromagnets",
          "Induction",
          "Applications",
          "Solenoids",
          "Motor Effect",
          "Right Hand Rule",
          "Electromagnetic Force",
        ],
      },
      {
        topic_name: "Heat",
        subtopics: [
          "Temperature",
          "Thermometers",
          "Expansion",
          "Conduction",
          "Convection",
          "Radiation",
          "Thermal Capacity",
          "Heat Transfer",
          "Insulators",
          "Real-life Applications",
        ],
      },
      {
        topic_name: "Waves",
        subtopics: [
          "Types of Waves",
          "Amplitude",
          "Frequency",
          "Wavelength",
          "Sound Waves",
          "Seismic Waves",
          "Wave Speed",
          "Echo",
          "Resonance",
          "Doppler Effect",
        ],
      },
      {
        topic_name: "Sound",
        subtopics: [
          "Propagation",
          "Speed",
          "Reflection",
          "Refraction",
          "Echoes",
          "Ultrasound",
          "Frequency",
          "Amplitude",
          "Pitch",
          "Applications",
        ],
      },
      {
        topic_name: "Units & Measurements",
        subtopics: [
          "SI Units",
          "Conversions",
          "Instruments",
          "Significant Figures",
          "Accuracy",
          "Precision",
          "Errors",
          "Graphs",
          "Tables",
          "Scalars and Vectors",
        ],
      },
    ],
  },
];
function main() {
  return __awaiter(this, void 0, void 0, function () {
    var _i, subjectsData_1, subject, createdSubject, _loop_1, _a, _b, topic;
    return __generator(this, function (_c) {
      switch (_c.label) {
        case 0:
          (_i = 0), (subjectsData_1 = subjectsData);
          _c.label = 1;
        case 1:
          if (!(_i < subjectsData_1.length)) return [3 /*break*/, 8];
          subject = subjectsData_1[_i];
          return [
            4 /*yield*/,
            prisma.subject.create({
              data: {
                subject_name: subject.subject_name,
              },
            }),
          ];
        case 2:
          createdSubject = _c.sent();
          _loop_1 = function (topic) {
            var createdTopic;
            return __generator(this, function (_d) {
              switch (_d.label) {
                case 0:
                  return [
                    4 /*yield*/,
                    prisma.topic.create({
                      data: {
                        topic_name: topic.topic_name,
                        subject_id: createdSubject.id,
                      },
                    }),
                  ];
                case 1:
                  createdTopic = _d.sent();
                  return [
                    4 /*yield*/,
                    prisma.subtopic.createMany({
                      data: topic.subtopics.map(function (sub) {
                        return {
                          subtopic_name: sub,
                          topic_id: createdTopic.id,
                        };
                      }),
                      skipDuplicates: true,
                    }),
                  ];
                case 2:
                  _d.sent();
                  return [2 /*return*/];
              }
            });
          };
          (_a = 0), (_b = subject.topics);
          _c.label = 3;
        case 3:
          if (!(_a < _b.length)) return [3 /*break*/, 6];
          topic = _b[_a];
          return [5 /*yield**/, _loop_1(topic)];
        case 4:
          _c.sent();
          _c.label = 5;
        case 5:
          _a++;
          return [3 /*break*/, 3];
        case 6:
          console.log("\u2705 Seeded subject: ".concat(subject.subject_name));
          _c.label = 7;
        case 7:
          _i++;
          return [3 /*break*/, 1];
        case 8:
          return [2 /*return*/];
      }
    });
  });
}
main()
  .catch(function (e) {
    console.error("❌ Seeding error:", e);
    process.exit(1);
  })
  .finally(function () {
    prisma.$disconnect();
  });
