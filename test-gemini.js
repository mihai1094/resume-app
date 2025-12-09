/**
 * Quick test script to verify Gemini API is working
 * Run with: node test-gemini.js
 */

const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config({ path: '.env.local' });

async function testGeminiAPI() {
  console.log('🧪 Testing Gemini API connection...\n');

  // Check if API key exists
  if (!process.env.GOOGLE_AI_API_KEY) {
    console.error('❌ Error: GOOGLE_AI_API_KEY not found in .env.local');
    process.exit(1);
  }

  console.log('✅ API key found');
  console.log(`   Key: ${process.env.GOOGLE_AI_API_KEY.substring(0, 20)}...`);

  try {
    // Initialize Gemini
    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY);

    // Use the latest Flash model - fast and cheap!
    const modelName = 'gemini-2.5-flash';
    const model = genAI.getGenerativeModel({ model: modelName });

    console.log('\n📤 Sending test request to Gemini...');
    console.log(`   Model: ${modelName} (latest Flash - fast & cheap!)`);
    console.log('   Prompt: Generate 3 resume bullet points for a Software Engineer\n');

    // Test with a simple resume generation
    const prompt = `Generate 3 professional resume bullet points for a Software Engineer at Google.

Requirements:
- Start with action verbs
- Include metrics
- Keep it concise

Return only the bullet points, one per line.`;

    const startTime = Date.now();
    const result = await model.generateContent(prompt);
    const endTime = Date.now();

    const response = result.response;
    const text = response.text();

    console.log('✅ API Response received successfully!\n');
    console.log('📊 Response Details:');
    console.log(`   Response time: ${endTime - startTime}ms`);
    console.log(`   Characters: ${text.length}`);
    console.log(`   Model: ${result.response.candidates?.[0]?.content?.role || 'model'}`);

    console.log('\n📝 Generated Content:');
    console.log('─'.repeat(60));
    console.log(text);
    console.log('─'.repeat(60));

    console.log('\n✅ SUCCESS! Gemini API is working correctly.');
    console.log('💡 You can now proceed with implementing AI features.\n');

    // Estimate cost
    const inputTokens = prompt.split(/\s+/).length * 1.3; // Rough estimate
    const outputTokens = text.split(/\s+/).length * 1.3;
    const cost = (inputTokens * 0.10 + outputTokens * 0.40) / 1_000_000;
    console.log(`💰 Estimated cost: $${cost.toFixed(6)} (essentially free!)`);

  } catch (error) {
    console.error('\n❌ Error testing Gemini API:');
    console.error(error.message);

    if (error.message.includes('API key not valid')) {
      console.error('\n💡 Tip: Make sure you copied the full API key from:');
      console.error('   https://aistudio.google.com/app/apikey');
    } else if (error.message.includes('quota')) {
      console.error('\n💡 Tip: You may have exceeded the free tier quota.');
      console.error('   Check your usage at: https://aistudio.google.com/');
    }

    process.exit(1);
  }
}

// Run the test
testGeminiAPI();
