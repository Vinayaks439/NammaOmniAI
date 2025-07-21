"""Publishes a JSON message to a Pub/Sub topic with an error handler."""
from google.cloud import pubsub_v1
from typing import Callable
import json
from concurrent.futures import TimeoutError

project_id = "namm-omni-dev"
topic_id = "traffic-update-data"
subscription_id = "traffic-update-subscription"
timeout = 500

publisher = pubsub_v1.PublisherClient()
topic_path = publisher.topic_path(project_id, topic_id)


def publish_messages(json_message: str, error_handler: Callable[[Exception], None]) -> None:
    try:
        # Optionally validate JSON input.
        parsed = json.dumps(json_message).encode("utf-8")
        # Publish the message as a byte string.
        future = publisher.publish(topic_path, data=parsed)
        message_id = future.result()  # Blocks until the message is published.
        print(f"Published message ID: {message_id}")
    except Exception as e:
        error_handler(e)




def callback(message: pubsub_v1.subscriber.message.Message) -> None:
    print(f"Received {message}.")
    message.ack()
    
def recieve_messages(callback: Callable[[pubsub_v1.subscriber.message.Message], None]) -> None:
    """Receives messages from a Pub/Sub subscription and calls the provided callback."""
    subscriber = pubsub_v1.SubscriberClient()
    # The `subscription_path` method creates a fully qualified identifier
    # in the form `projects/{project_id}/subscriptions/{subscription_id}`
    subscription_path = subscriber.subscription_path(project_id, subscription_id)



    streaming_pull_future = subscriber.subscribe(subscription_path, callback=callback)
    print(f"Listening for messages on {subscription_path}..\n")

    # Wrap subscriber in a 'with' block to automatically call close() when done.
    with subscriber:
        try:
            # When `timeout` is not set, result() will block indefinitely,
            # unless an exception is encountered first.
            streaming_pull_future.result(timeout=timeout)
        except TimeoutError:
            streaming_pull_future.cancel()  # Trigger the shutdown.
            streaming_pull_future.result()  # Block until the shutdown is complete.