import { DynamoDB } from '@aws-sdk/client-dynamodb'
import { Handler } from 'aws-lambda'
import { log } from '/opt/logging'

const dynamo = new DynamoDB({})

export const handler: Handler = async (event: {
	Payload: {
		Status: string
		Item: {
			id: string
			customValue: number
		}
	}
}) => {
	log('end step', event)

	if (event.Payload === null) {
		return {
			Payload: {
				Status: 'FAILED',
				message: 'Payload is required',
			},
		}
	}

	// soft delete the item
	await dynamo.updateItem({
		TableName: 'STEPFUNCTION_ITEMS',
		Key: {
			id: { S: event.Payload.Item.id },
		},
		UpdateExpression: 'SET #deleted = :deleted',
		ExpressionAttributeNames: {
			'#deleted': 'deleted',
		},
		ExpressionAttributeValues: {
			':deleted': { BOOL: true },
		},
	})

	return {
		Payload: {
			Status: 'SUCCESS',
		},
	}
}
