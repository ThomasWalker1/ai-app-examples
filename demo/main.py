import json
from typing import Dict, List, Iterator, Optional, Union

from gemini import Gemini, GeminiException

class BaseMessage:
    def __init__(self, speaker: str, content: str) -> None:
        self.speaker = speaker
        self.content = content
    
    def __repr__(self) -> str:
        return f"{self.__class__.__name__}(speaker={self.speaker}, content={repr(self.content)})"
    
    def __str__(self) -> str:
        return self.content

    def serialize(self) -> Dict[str, str]:
        return {"speaker": self.speaker, "content": self.content}


class HumanMessage(BaseMessage):
    def __init__(self, content: str) -> None:
        super().__init__(speaker="human", content=content)

    @classmethod
    def create_from_prompt(cls) -> "HumanMessage":
        content = input("> ")
        return cls(content)


class AIMessage(BaseMessage):
    def __init__(self, content: str) -> None:
        super().__init__(speaker="ai", content=content)

    @classmethod
    def create_from_prompt(cls, prompt: str, **model_kwargs) -> "AIMessage":
        content = Gemini(**model_kwargs).run(prompt)
        return cls(content)
    

MessageType = Union[HumanMessage, AIMessage]

class Transcript:
    def __init__(self, messages: Optional[List[MessageType]]=None) -> None:
        self.messages = messages if messages is not None else []

    def __iter__(self) -> Iterator[MessageType]:
        return iter(self.messages)
    
    def add(self, message: MessageType) -> None:
        self.messages.append(message)

    def serialize(self) -> List[Dict[str, str]]:
        return [message.serialize() for message in self.messages]


class GameState:
    """
    Manages the state of the game, including the problem, environment, and transcript.
    """
    def __init__(self, problem_description):
        self.problem = problem_description
        self.environment = {
            "mass": 10,  # in kg
            "incline_angle": 30,  # in degrees
            "coeff_static_friction": 0.6,
            "gravity": 9.81
        }
        self.transcript = Transcript()
        self.probes = {
            "mass_scale": True,
            "inclinometer": True,
            "force_sensor": False # Starts as unavailable
        }

    def add_to_transcript(self, message: MessageType) -> None:
        """Adds an entry to the transcript."""
        self.transcript.add(message)

    def get_transcript(self, serialize: bool=False) -> Transcript:
        """Returns the full transcript."""
        if serialize:
            return self.transcript.serialize()
        return self.transcript

    def save_transcript(self, filename="demo/transcript.json") -> None:
        """Saves the transcript to a file."""
        with open(filename, "w") as f:
            json.dump(self.transcript.serialize(), f, indent=4)

def get_llm_response(human_message: HumanMessage, game_state: GameState) -> AIMessage:
    """Acts as the gamemaster (LLM), responding to user actions and providing guidance."""
    # Use a more sophisticated prompt for the LLM
    full_prompt = f"""You are a physics tutor gamemaster.
    The user is solving the following problem: {game_state.problem}
    The current state of the environment is: {game_state.environment}
    The user has access to the following tools: {game_state.probes}
    The conversation so far is:\n{json.dumps(game_state.get_transcript(serialize=True))}

    User's latest action: '{human_message}'

    Based on this, provide a helpful response. If the user is measuring something, provide the value from the environment.
    If the user is stuck, provide a Socratic hint.
    If the user provides an answer, check it.
    """

    return AIMessage.create_from_prompt(full_prompt)


def main():
    """The main game loop."""

    problem = "You are in a physics lab. In front of you is a wooden block resting on an adjustable inclined plane. Your goal is to determine the coefficient of static friction between the block and the plane. You have a mass scale and an inclinometer at your disposal."
    game_state = GameState(problem)

    print("\033[93mWelcome to the Physics Problem-Solving Game!")
    print(f"\n--- The Problem ---\n{game_state.problem}")
    print("\nDescribe your actions to the AI (e.g., 'measure mass', 'what are the forces?'). Type 'quit' to exit.\x1b[0m")

    while True:
        human_message = HumanMessage.create_from_prompt()
        game_state.add_to_transcript(human_message)

        if human_message.content.lower() == "quit":
            print("\n\x1b[34mThanks for playing!\x1b[0m")
            game_state.save_transcript()
            print("\033[93mTranscript saved to transcript.json\x1b[0m")
            break

        # Get the AI's response
        try:
            ai_message = get_llm_response(human_message, game_state)
            print(f"\n\x1b[34m{ai_message}\n\x1b[0m")
            game_state.add_to_transcript(ai_message)
        except GeminiException as e:
            print(f"\x1b[31mError communicating with the AI: {e}\x1b[0m")


if __name__ == "__main__":
    main()
