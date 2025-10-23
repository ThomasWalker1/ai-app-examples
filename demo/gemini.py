import subprocess
from multiprocessing import Pool

class GeminiException(Exception):
    """Custom exception for Gemini errors."""
    pass

class Gemini:
    def __init__(self, api_key: str=None, model: str="gemini-2.5-flash") -> None:
        self.api_key = api_key
        self.model = model

    def run(self, prompt: str) -> str:
        """Calls the Gemini CLI with a given prompt.

        Args:
            prompt: The prompt to send to the model.
            model: Optional. The name of the model to use for this specific call.

        Returns:
            The response from the model as a string.

        Raises:
            GeminiException: If the 'gemini' command is not found or if there's an error executing it.
        """
        
        try:
            cmd_list = ["gemini", "-m", self.model, "-p", prompt]
            result = subprocess.run(
                cmd_list,
                capture_output=True,
                text=True,
                check=True,
            )
            return result.stdout.strip()
        except FileNotFoundError:
            raise GeminiException("The 'gemini' command was not found. Please ensure it is installed and in your PATH.")
        except subprocess.CalledProcessError as e:
            raise GeminiException(f"Error executing Gemini CLI: {e.stderr}")

    def batch(self, prompts: list[str]) -> list[str]:
        """Runs a batch of prompts through Gemini CLI in parallel.

        Args:
            prompts: A list of prompts to send to the model.
        
        Returns: 
            A list of responses from the model.
        
        Raises:
            GeminiException: If the 'gemini' command is not found or if there's an error executing it.
        """
        with Pool() as pool:
            results = pool.map(self.run, prompts)
        return results
