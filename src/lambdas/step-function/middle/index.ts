import { DynamoDB } from '@aws-sdk/client-dynamodb'
import { Handler } from 'aws-lambda'
import { log } from '/opt/logging'

const dynamo = new DynamoDB({})

export const handler: Handler = async (event: {
	Payload: {
		Status: string
		Item: {
			id: string
			customValue: number | string
		}
	}
}) => {
	log('middle step', event)

	if (event.Payload === null) {
		return {
			Payload: {
				Status: 'FAILED',
				message: 'Payload is required',
			},
		}
	}

	if (typeof event.Payload.Item.customValue != 'number') {
		return {
			Payload: {
				Status: 'FAILED',
				message: 'Item is required and must be a number',
			},
		}
	}

	const newValue = event.Payload.Item.customValue * 2

	await dynamo.updateItem({
		TableName: 'STEPFUNCTION_ITEMS',
		Key: {
			id: { S: event.Payload.Item.id },
		},
		UpdateExpression: 'SET #value = :value',
		ExpressionAttributeNames: {
			'#value': 'value',
		},
		ExpressionAttributeValues: {
			':value': { N: newValue.toString() },
		},
	})

	return {
		Payload: {
			Status: 'SUCCESS',
			Item: {
				id: event.Payload.Item.id,
				value: newValue,
			},
		},
	}
}
