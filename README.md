# Automation of experiential learning with customized, adaptable, and incremental path for skills acquisition.

## **Background**

Education provides knowledge. Knowledge transforms students by introducing skills. Skills
make students get employment. Experiential learning makes this process more intuitive.
Automating this experiential learning can streamline skills of students by making every
stakeholder accountable and responsive. Thus, we could pave the path for more Innovations,
skills, and employment.

HamaraLabs is an education technology platform automating experiential learning to bring it
in-practice to students. It starts with automating 10,000+ Atal Tinkering Labs (ATLs). ATLs are
set up by Atal Innovation Mission (AIM) of NITI-Aayog, Govt. of India. These are workspaces
in schools for students (6th to 12th class) to give shape to their ideas through hands-on do-it-
yourself mode and learn innovation skills. Further, HamaraLabs caters to non-ATL school
students making all stakeholders accountable to skill development process in students.

## **Salient features of web app/mobile app**

- ATL Team formation/ Roles assignment/ Components Identification & tracking
- ATL Tinkering activities workflow/tracking/documentation
- ATL in-charge task management
- ATL Student teams/Experiments/Skills/Innovations repository
- ATL capability dashboard with scores and grading
- ATL alumni handling
- ATL Vendor management & tool selection process
- Integration with existing AIM Mentor connect process
- Customised subsequent experiment assignment using Artificial Intelligence
- Experiment identification and assignment
- Competitions exploration/assignment with milestone tracking
- Student skills showcase
- Communications workflow for Students/Parents/teachers/Mentors etc
- Trainings Identification/offering & tracking
- In-school initiatives connect and customization
- Community school connection workflow and tracking
- Risk management
- Security management
- Partnership creation & management

## **User Profiles and their purpose of accessing web app/mobile app**

- ATL / non-ATL student - Actual student doing tinkering activity
- ATL/makerspace In-charge – In-charge of ATL lab helping students perform tinkering
  activities at ground level
- ATL Mentor of Change - Mentors appointed by Atal Innovation Mission or external
  mentors appointed by school management. They identify innovation areas and guide
  students.
- ATL Regional Mentors of Change - Regional mentors have to back fill mentors in
  some cases, guide mentors and identify best practices across ATL’s and implement
  them.
- ATL/makerspace principal/management - They need to know what is happening in
  ATL through school management dashboard.
- ATL partners - HEIs and government bodies/businesses who support ATL’s need to
  get reports on a timely basis.
- AIM Team - Get timely reports on setup, usage of ATL resources. compliance
  procedures, Monthly dashboards, Utilisation certificates, request for further funding
  etc
- AIM Management - Get score cards/rankings of ATL’s as per their functioning level,
  Innovations developed, community engagement, fund utilisation etc

## **Stakeholders and their concerns**

The complete list of all stakeholders is depicted in this diagram.

A sample list of concerns from End-user organization are depicted here:

## **Usage scenarios**

- ATL or makerspace setup in a school – during the initial setting up of
  ATL/makerspace
- ATL/makerspace Execution – during the functional execution of ATL/makerspace
  while students start doing tinkering activities
- ATL/makerspace partner connect – when ATL’s partner with Higher educational
  institutions, corporates government bodies etc
- ATL community programs - when ATL’s connect with non-ATL schools to perform
  community day programs
- Competitions – when ATL’s want their students participate in various competitions
  like ATL Tinkerpreneur, Marathon, Smart India hackathon etc

## **Sample workflow of an ATL executing student tinkering activities**

- Identify around 15 team leaders and add their student profiles
- Discuss with team leaders to understand their aspirations and thoughts. Update the
  same in their profiles and the platform suggests an initial experiment
- Give application access to team leaders so that they take ownership and upload their
  team members details
- Teams start collecting components by knowing each of the components from the
  component repository section, identify available components and knowing the
  availability of unavailable components from nearest/preferred ATL or vendor. ATL in-
  charge would handhold the process
- ATL Mentor to initiate discussion with teams and identify the right mentor from
  mentor connect module if he warrants deep knowledge in respective
  domain/technology.
- ATL Mentors & school management/principal to work on identifying the right HEI &
  Industry partnerships and proceed with Memorandum of Understanding (MoU)
  procedures. Use the partner onboarding process, college connect form and business
  connect form.


## Tech stack

- Next JS (App router)
- Tailwind CSS
- Typescript
- Prisma ORM
- Authentication - Authentik (self-hosted)
- Database - Postgresql (self-hosted)

## Setup

- Install docker desktop (follow https://docs.docker.com/desktop)
- Run authentik (follow https://docs.goauthentik.io/docs/install-config/install/docker-compose) and postgresql containers in docker
- Create an application and a provider in authentik admin interface
- While creating provider enter atleast one redirect URI (eg:- http://localhost:3000/api/auth/callback/authentik)
- Clone this repo, copy ".env.example", rename it to ".env" and enter necessary details
- In the terminal run the following set of commands -
  - npm install
  - npx prisma migrate dev --name first_migration
  - npx prisma generate
  - npm run dev   
- Yay !!! You have an up and running HamaraLabs in your local system !
