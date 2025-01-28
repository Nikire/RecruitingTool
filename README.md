# RecruitingTool

Recruiting tool is a modern app based on HR tools. This app provides a simple way to keep track of recruitments, helping HR teams manage candidates, streamline the hiring process, and make data-driven decisions. It offers features such as applicant tracking, interview scheduling, collaborative feedback, and customizable dashboards to monitor progress. The tool also supports technical interview applications, allowing companies to assess candidates' skills through coding tests, project submissions, and live technical challenges. Additionally, it provides a fully customizable hiring process, enabling HR teams to tailor workflows, evaluation criteria, and interview stages to meet specific organizational needs. With seamless integration to popular job boards, it ensures all recruitment activities are centralized for maximum efficiency.

## Installation (Docker)

1. Setup `.env` files on the root of the project and in every module that requires a `.env` file setup (see `.env.example` files for reference)

2. Run the following command to build the docker image:

```bash
docker-compose build
```

3. Run the following command to start the docker container:

```bash
docker-compose up
```

## Swagger

You can see the API documentation by visiting the following URL once you got the app running: `http://localhost:{YOUR-SELECTED-BACKEND-PORT}/api`
