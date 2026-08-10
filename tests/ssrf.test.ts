import assert from 'node:assert/strict';
import test from 'node:test';
import { isPrivateIp, SsrfError, assertSafeUrl } from '../src/security/ssrf.ts';

test('isPrivateIp detects common private ranges', () => {
  assert.equal(isPrivateIp('127.0.0.1'), true);
  assert.equal(isPrivateIp('10.0.0.1'), true);
  assert.equal(isPrivateIp('192.168.1.1'), true);
  assert.equal(isPrivateIp('172.16.0.1'), true);
  assert.equal(isPrivateIp('169.254.169.254'), true);
  assert.equal(isPrivateIp('8.8.8.8'), false);
});

test('assertSafeUrl blocks localhost hostname', async () => {
  await assert.rejects(() => assertSafeUrl('http://localhost:3000'), SsrfError);
  await assert.rejects(() => assertSafeUrl('http://127.0.0.1/'), SsrfError);
});

test('assertSafeUrl rejects non-http protocols', async () => {
  await assert.rejects(() => assertSafeUrl('file:///etc/passwd'), SsrfError);
});
