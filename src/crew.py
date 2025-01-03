from crewai import Agent, Crew, Process, Task
from crewai.project import CrewBase, agent, crew, task
import tools

@CrewBase
class SunsetpredictoragentCrew():
    """sunset_predictor_agent crew"""

    # Agent definitions
    @agent
    def weather_scraper(self) -> Agent:
        return Agent(
            config=self.agents_config['weather_scraper'],
            tools=[tools.web_scrape], # add tools here or use `agentstack tools add <tool_name>
            verbose=True,
        )

    @agent
    def sunset_predictor(self) -> Agent:
        return Agent(
            config=self.agents_config['sunset_predictor'],
            tools=[], # add tools here or use `agentstack tools add <tool_name>
            verbose=True,
        )

    # Task definitions
    @task
    def scrape_weather(self) -> Task:
        return Task(
            config=self.tasks_config['scrape_weather'],
        )

    @task
    def predict_sunset(self) -> Task:
        return Task(
            config=self.tasks_config['predict_sunset'],
        )

    @crew
    def crew(self) -> Crew:
        """Creates the Test crew"""
        return Crew(
            agents=self.agents, # Automatically created by the @agent decorator
            tasks=self.tasks, # Automatically created by the @task decorator
            process=Process.sequential,
            verbose=True,
            # process=Process.hierarchical, # In case you wanna use that instead https://docs.crewai.com/how-to/Hierarchical/
        )