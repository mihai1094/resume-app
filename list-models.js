/**
 * List available Gemini models
 */

const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config({ path: '.env.local' });

async function listModels() {
  console.log('📋 Listing available Gemini models...\n');

  if (!process.env.GOOGLE_AI_API_KEY) {
    console.error('❌ Error: GOOGLE_AI_API_KEY not found');
    process.exit(1);
  }

  const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY);

  try {
    const models = await genAI.listModels();

    console.log('✅ Available models:\n');

    models.forEach((model) => {
      console.log(`📦 ${model.name}`);
      console.log(`   Display Name: ${model.displayName}`);
      console.log(`   Supported Methods: ${model.supportedGenerationMethods?.join(', ') || 'N/A'}`);
      console.log(`   Input Token Limit: ${model.inputTokenLimit || 'N/A'}`);
      console.log(`   Output Token Limit: ${model.outputTokenLimit || 'N/A'}`);
      console.log('');
    });

    console.log('💡 Recommended models for resume generation:');
    const flashModels = models.filter(m =>
      m.name.includes('flash') || m.name.includes('gemini-pro')
    );

    if (flashModels.length > 0) {
      flashModels.forEach(m => {
        console.log(`   - ${m.name} (${m.displayName})`);
      });
    } else {
      console.log('   Use any model that supports "generateContent" method');
    }

  } catch (error) {
    console.error('❌ Error listing models:', error.message);
    process.exit(1);
  }
}

listModels();
