import { DynamoDB } from '@aws-sdk/client-dynamodb'
import { APIGatewayProxyHandler } from 'aws-lambda'
import { log } from '/opt/logging'

const dynamo = new DynamoDB({})

export const handler: APIGatewayProxyHandler = async () => {
	log('read-all event')

	const result = await dynamo.scan({
		TableName: 'SANDBOX_ITEMS',
	})

	let items: { id: string; name: string }[] = []
	if (result.Items) {
		items = result.Items.map((item) => ({
			id: item.id.S ?? '',
			name: item.name.S ?? '',
		}))
	}

	return {
		statusCode: 200,
		body: JSON.stringify({
			items: items,
		}),
	}
}
