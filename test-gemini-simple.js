/**
 * Simple test with different model names
 */

const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config({ path: '.env.local' });

const modelsToTry = [
  'gemini-1.5-flash-002',
  'gemini-1.5-pro-002',
  'gemini-1.5-flash',
  'gemini-1.5-pro',
  'gemini-flash',
  'gemini-pro',
];

async function testModel(modelName) {
  console.log(`\n🔍 Trying model: ${modelName}`);

  try {
    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY);
    const model = genAI.getGenerativeModel({ model: modelName });

    const result = await model.generateContent('Say hello in one word');
    const text = result.response.text();

    console.log(`   ✅ SUCCESS! Response: "${text}"`);
    console.log(`   ✅ This model works: ${modelName}\n`);
    return modelName;
  } catch (error) {
    console.log(`   ❌ Failed: ${error.message.substring(0, 100)}...`);
    return null;
  }
}

async function main() {
  console.log('🧪 Testing different Gemini models to find what works...');
  console.log('═'.repeat(60));

  for (const modelName of modelsToTry) {
    const workingModel = await testModel(modelName);
    if (workingModel) {
      console.log('═'.repeat(60));
      console.log(`\n🎉 Found working model: ${workingModel}`);
      console.log('\n💡 Use this model name in your code.');
      process.exit(0);
    }
  }

  console.log('\n❌ None of the common models worked.');
  console.log('\n💡 Try these steps:');
  console.log('   1. Check your API key at: https://aistudio.google.com/app/apikey');
  console.log('   2. Make sure the key is enabled for Gemini API');
  console.log('   3. Check if you need to enable billing');
}

main();
