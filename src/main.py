#!/usr/bin/env python
import sys
import yaml
from crew import SunsetpredictoragentCrew
import agentops
from dotenv import load_dotenv
import os
import json

agentops.init(default_tags=['crewai', 'agentstack'])

def replace_info(file_path):
    try:
        load_dotenv()

        api_key = os.getenv("OPENWEATHERMAP_API_KEY")
        if not api_key:
            raise ValueError("API_KEY is not set in the .env file.")
        
        js_file_path = os.path.join(os.path.dirname(__file__), 'data.js')

        with open(js_file_path, "r") as js_file:
            js_content = js_file.read()
        
        try:
            start_index = js_content.index("var locations = ") + len("var locations = ")
            end_index = js_content.index(";", start_index)
            json_data = js_content[start_index:end_index].strip()
            locations = json.loads(json_data)
        except Exception as e:
            raise Exception(f"Error parsing locations from data.js: {e}")
        
        if not locations:
            raise ValueError("No locations found in data.js.")

        lat = locations[-1]["latitude"]
        lon = locations[-1]["longitude"]

        with open(file_path, "r") as file:
            config = yaml.safe_load(file)

        config["scrape_weather"]["description"] = (
            f"scrape weather parameters like cloud cover, humidity, and visibility "
            f"from https://api.openweathermap.org/data/2.5/weather?lat={lat}&lon={lon}&appid={api_key}"
        )

        with open(file_path, "w") as file:
            yaml.dump(config, file, default_flow_style=False, sort_keys=False)

    except Exception as e:
        raise Exception(f"An error occurred while processing the files: {e}")

def run():
    """
    Run the crew.
    """
    inputs = {}  # You can add inputs as needed
    SunsetpredictoragentCrew().crew().kickoff(inputs=inputs)


if __name__ == '__main__':
    yaml_file = "src/config/tasks.yaml"
    replace_info(yaml_file)
    run()
