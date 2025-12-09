/**
 * Test script to verify cache is working
 * Run with: node test-cache.js
 */

async function testCache() {
  console.log('🧪 Testing AI Cache Mechanism\n');

  const baseUrl = 'http://localhost:3000';

  // Test data
  const testRequest = {
    position: 'Software Engineer',
    company: 'Google',
    industry: 'Technology',
  };

  console.log('📝 Test Request:', testRequest);
  console.log('');

  // Test 1: First request (should be MISS)
  console.log('Test 1: First request (should generate new content)');
  console.log('─'.repeat(60));
  const start1 = Date.now();
  const response1 = await fetch(`${baseUrl}/api/ai/generate-bullets`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(testRequest),
  });
  const data1 = await response1.json();
  const time1 = Date.now() - start1;

  console.log(`✓ Status: ${response1.status}`);
  console.log(`✓ Time: ${time1}ms`);
  console.log(`✓ From Cache: ${data1.meta.fromCache}`);
  console.log(`✓ Bullet Points: ${data1.bulletPoints.length}`);
  console.log(`✓ Hit Rate: ${data1.meta.cacheStats.hitRate}`);
  console.log(`✓ Savings: ${data1.meta.cacheStats.estimatedSavings}`);
  console.log('');

  // Wait a bit
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // Test 2: Second request (should be HIT)
  console.log('Test 2: Second request (should be from cache)');
  console.log('─'.repeat(60));
  const start2 = Date.now();
  const response2 = await fetch(`${baseUrl}/api/ai/generate-bullets`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(testRequest),
  });
  const data2 = await response2.json();
  const time2 = Date.now() - start2;

  console.log(`✓ Status: ${response2.status}`);
  console.log(`✓ Time: ${time2}ms (${((time2 / time1) * 100).toFixed(1)}% of first request)`);
  console.log(`✓ From Cache: ${data2.meta.fromCache}`);
  console.log(`✓ Bullet Points: ${data2.bulletPoints.length}`);
  console.log(`✓ Hit Rate: ${data2.meta.cacheStats.hitRate}`);
  console.log(`✓ Savings: ${data2.meta.cacheStats.estimatedSavings}`);
  console.log('');

  // Test 3: Different request (should be MISS)
  console.log('Test 3: Different position (should generate new content)');
  console.log('─'.repeat(60));
  const testRequest2 = {
    position: 'Product Manager',
    company: 'Apple',
    industry: 'Technology',
  };
  const start3 = Date.now();
  const response3 = await fetch(`${baseUrl}/api/ai/generate-bullets`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(testRequest2),
  });
  const data3 = await response3.json();
  const time3 = Date.now() - start3;

  console.log(`✓ Status: ${response3.status}`);
  console.log(`✓ Time: ${time3}ms`);
  console.log(`✓ From Cache: ${data3.meta.fromCache}`);
  console.log(`✓ Bullet Points: ${data3.bulletPoints.length}`);
  console.log(`✓ Hit Rate: ${data3.meta.cacheStats.hitRate}`);
  console.log(`✓ Savings: ${data3.meta.cacheStats.estimatedSavings}`);
  console.log('');

  // Test 4: Get cache stats
  console.log('Test 4: Cache Statistics');
  console.log('─'.repeat(60));
  const statsResponse = await fetch(`${baseUrl}/api/ai/cache-stats`);
  const stats = await statsResponse.json();

  console.log('📊 Overall Stats:');
  console.log(`   Hit Rate: ${stats.overall.hitRate}`);
  console.log(`   Total Hits: ${stats.overall.totalHits}`);
  console.log(`   Total Requests: ${stats.overall.totalRequests}`);
  console.log(`   Estimated Savings: ${stats.overall.estimatedSavings}`);
  console.log(`   Projected Monthly Savings: ${stats.overall.savingsPerMonth}`);
  console.log('');

  console.log('💡 Recommendations:');
  stats.recommendations.forEach((rec) => console.log(`   ${rec}`));
  console.log('');

  // Summary
  console.log('═'.repeat(60));
  console.log('✅ CACHE TEST SUMMARY');
  console.log('═'.repeat(60));
  console.log(`✓ First request: ${time1}ms (generated fresh)`);
  console.log(`✓ Cached request: ${time2}ms (${Math.round((1 - time2 / time1) * 100)}% faster)`);
  console.log(`✓ Cache is working: ${data2.meta.fromCache === true ? 'YES ✅' : 'NO ❌'}`);
  console.log(`✓ Cost savings: ${stats.overall.estimatedSavings}`);
  console.log('');

  if (data2.meta.fromCache) {
    console.log('🎉 SUCCESS! Cache is working perfectly!');
    console.log('💰 You\'re now saving money on repeated requests!');
  } else {
    console.log('❌ WARNING: Cache might not be working correctly.');
    console.log('   Check the server logs for errors.');
  }
}

// Run the test
testCache().catch((error) => {
  console.error('❌ Test failed:', error.message);
  process.exit(1);
});
