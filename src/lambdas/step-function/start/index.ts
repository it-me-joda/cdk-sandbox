import { DynamoDB } from '@aws-sdk/client-dynamodb'
import { Handler } from 'aws-lambda'
import { log } from '/opt/logging'
import { randomUUID } from 'crypto'

const dynamo = new DynamoDB({})

export const handler: Handler = async (event: { Payload: number | string }) => {
	log('start step', event)

	if (event.Payload === null) {
		return {
			Payload: {
				Status: 'FAILED',
				message: 'Payload is required',
			},
		}
	}

	const id = randomUUID()
	await dynamo.putItem({
		TableName: 'STEPFUNCTION_ITEMS',
		Item: {
			id: { S: id },
			value: { N: event.Payload.toString() },
		},
	})

	return {
		Payload: {
			Status: 'SUCCESS',
			Item: {
				id,
				customValue: event.Payload,
			},
		},
	}
}
