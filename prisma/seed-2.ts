import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const subjectsData: {
  subject_name: string;
  topics: { topic_name: string; subtopics: string[] }[];
}[] = [
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

async function main() {
  for (const subject of subjectsData) {
    const createdSubject = await prisma.subject.create({
      data: {
        subject_name: subject.subject_name,
      },
    });

    for (const topic of subject.topics) {
      const createdTopic = await prisma.topic.create({
        data: {
          topic_name: topic.topic_name,
          subject_id: createdSubject.id,
        },
      });

      await prisma.subtopic.createMany({
        data: topic.subtopics.map((sub) => ({
          subtopic_name: sub,
          topic_id: createdTopic.id,
        })),
        skipDuplicates: true,
      });
    }

    console.log(`✅ Seeded subject: ${subject.subject_name}`);
  }
}

main()
  .catch((e) => {
    console.error("❌ Seeding error:", e);
    process.exit(1);
  })
  .finally(() => {
    prisma.$disconnect();
  });
