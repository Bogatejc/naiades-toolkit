from time import sleep
import sys
import os

sys.path.append(os.path.abspath('./download'))

from APIClient import NaiadesClient
from output import KafkaOutput

client = NaiadesClient("config/client5981.json")

# Some code...

client.obtain()

# Some code...

client.obtain()