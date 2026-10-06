const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, UpdateCommand, PutCommand } = require('@aws-sdk/lib-dynamodb');

const client = new DynamoDBClient({ region: 'ap-southeast-1' });
const docClient = DynamoDBDocumentClient.from(client);

exports.handler = async (event) => {
  const userId = event.requestContext.authorizer.claims.sub;
  const body = JSON.parse(event.body);
  
  const { stageId, difficulty, score, correct, total, stars, maxStreak, xpEarned, badges, isDaily } = body;
  
  try {
    // Update player stats
    await docClient.send(new UpdateCommand({
      TableName: 'eduq-games-players',
      Key: { userId },
      UpdateExpression: 'SET #xp = if_not_exists(#xp, :zero) + :xpEarned, #stats.totalCorrect = if_not_exists(#stats.totalCorrect, :zero) + :correct, #stats.totalAnswered = if_not_exists(#stats.totalAnswered, :zero) + :total, #stats.bestStreak = if_not_exists(#stats.bestStreak, :zero), #stats.roundsPlayed = if_not_exists(#stats.roundsPlayed, :zero) + :one, #stats.perfectRounds = if_not_exists(#stats.perfectRounds, :zero) + :perfectInc, #badges = list_append(if_not_exists(#badges, :emptyList), :newBadges), #updatedAt = :now, #stageProgress.#stageId = if_not_exists(#stageProgress.#stageId, :emptyStage)',
      ExpressionAttributeNames: {
        '#xp': 'xp',
        '#stats': 'stats',
        '#badges': 'badges',
        '#updatedAt': 'updatedAt',
        '#stageProgress': 'stageProgress',
        '#stageId': stageId
      },
      ExpressionAttributeValues: {
        ':zero': 0,
        ':one': 1,
        ':xpEarned': xpEarned,
        ':correct': correct,
        ':total': total,
        ':now': Date.now(),
        ':emptyList': [],
        ':newBadges': badges || [],
        ':perfectInc': correct === total ? 1 : 0,
        ':emptyStage': { unlocked: true, bestStars: stars, highScore: score }
      }
    }));
    
    // Save to leaderboard
    const scoreId = `${userId}-${Date.now()}`;
    await docClient.send(new PutCommand({
      TableName: 'eduq-games-leaderboard',
      Item: {
        scoreId,
        userId,
        score,
        stageId,
        difficulty,
        stars,
        maxStreak,
        createdAt: Date.now()
      }
    }));
    
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type,Authorization',
        'Access-Control-Allow-Methods': 'POST,OPTIONS'
      },
      body: JSON.stringify({ success: true, scoreId })
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
