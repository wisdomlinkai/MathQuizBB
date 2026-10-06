const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, GetCommand } = require('@aws-sdk/lib-dynamodb');

const client = new DynamoDBClient({ region: 'ap-southeast-1' });
const docClient = DynamoDBDocumentClient.from(client);

exports.handler = async (event) => {
  const userId = event.requestContext.authorizer.claims.sub;
  
  try {
    const result = await docClient.send(new GetCommand({
      TableName: 'eduq-games-players',
      Key: { userId }
    }));
    
    if (!result.Item) {
      // Return default stats for new player
      return {
        statusCode: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type,Authorization',
          'Access-Control-Allow-Methods': 'GET,OPTIONS'
        },
        body: JSON.stringify({
          userId,
          name: event.requestContext.authorizer.claims.email || 'Player',
          avatar: 'cat',
          xp: 0,
          badges: [],
          stats: {
            totalCorrect: 0,
            totalAnswered: 0,
            bestStreak: 0,
            roundsPlayed: 0,
            perfectRounds: 0
          },
          stageProgress: {
            addition: { unlocked: true, bestStars: 0, highScore: 0 },
            subtraction: { unlocked: false, bestStars: 0, highScore: 0 },
            mixed: { unlocked: false, bestStars: 0, highScore: 0 },
            multiplication: { unlocked: false, bestStars: 0, highScore: 0 },
            division: { unlocked: false, bestStars: 0, highScore: 0 },
            mixed_mul: { unlocked: false, bestStars: 0, highScore: 0 }
          },
          dailyLastDate: null,
          dailyStreak: 0
        })
      };
    }
    
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type,Authorization',
        'Access-Control-Allow-Methods': 'GET,OPTIONS'
      },
      body: JSON.stringify(result.Item)
    };
  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ error: 'Internal server error' })
    };
  }
};
