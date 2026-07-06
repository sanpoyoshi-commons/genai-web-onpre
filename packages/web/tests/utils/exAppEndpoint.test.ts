import { describe, expect, it } from 'vitest';
import { isValidExAppEndpoint } from '../../src/utils/exAppEndpoint';

describe('isValidExAppEndpoint', () => {
  describe('正常系 - https（公開・従来どおり）', () => {
    it('https の公開エンドポイントを許可する', () => {
      expect(isValidExAppEndpoint('https://api.example.com/requests')).toBe(true);
      expect(isValidExAppEndpoint('https://example.co.jp/v1/run?x=1')).toBe(true);
    });
  });

  describe('正常系 - http ローカル宛（緩和対象）', () => {
    it('http://localhost を許可する', () => {
      expect(isValidExAppEndpoint('http://localhost:8080/run')).toBe(true);
      expect(isValidExAppEndpoint('http://localhost')).toBe(true);
    });

    it('http://host.docker.internal を許可する', () => {
      expect(isValidExAppEndpoint('http://host.docker.internal:3000/run')).toBe(true);
    });

    it('内部コンテナ名（単一ラベル）を許可する', () => {
      expect(isValidExAppEndpoint('http://echo-app:3000/run')).toBe(true);
    });

    it('プライベート IP を許可する', () => {
      expect(isValidExAppEndpoint('http://192.168.0.5:3000/run')).toBe(true);
      expect(isValidExAppEndpoint('http://127.0.0.1:8080')).toBe(true);
    });
  });

  describe('異常系', () => {
    it('http の公開ドメインは拒否する（公開は https 推奨）', () => {
      expect(isValidExAppEndpoint('http://example.com/run')).toBe(false);
    });

    it('スキーム無し・非 http(s) を拒否する', () => {
      expect(isValidExAppEndpoint('ftp://example.com')).toBe(false);
      expect(isValidExAppEndpoint('example.com')).toBe(false);
      expect(isValidExAppEndpoint('file:///etc/passwd')).toBe(false);
    });

    it('空文字を拒否する', () => {
      expect(isValidExAppEndpoint('')).toBe(false);
    });
  });
});
