/**
 * Municipal Notice Authorization Tests
 *
 * Phase 3: Tests for municipal notice restrictions.
 *
 * Test coverage:
 * - validateDualMunicipalTags: reject both vis + komiza
 * - checkMunicipalNoticeAuth: scope-based authorization
 * - Breakglass bypass: true breakglass ignores municipal scope
 */

import { describe, it, expect } from 'vitest';
import { validateDualMunicipalTags } from '../types/inbox.js';
import { checkMunicipalNoticeAuth } from '../middleware/auth.js';

describe('Municipal Notice Tag Validation', () => {
  describe('validateDualMunicipalTags', () => {
    it('should allow no municipal tags', () => {
      const result = validateDualMunicipalTags(['opcenito']);
      expect(result.valid).toBe(true);
    });

    it('should allow only vis tag', () => {
      const result = validateDualMunicipalTags(['vis']);
      expect(result.valid).toBe(true);
    });

    it('should allow only komiza tag', () => {
      const result = validateDualMunicipalTags(['komiza']);
      expect(result.valid).toBe(true);
    });

    it('should allow vis + non-municipal tag', () => {
      const result = validateDualMunicipalTags(['vis', 'hitno']);
      expect(result.valid).toBe(true);
    });

    it('should allow komiza + non-municipal tag', () => {
      const result = validateDualMunicipalTags(['komiza', 'promet']);
      expect(result.valid).toBe(true);
    });

    it('should reject both vis and komiza tags', () => {
      const result = validateDualMunicipalTags(['vis', 'komiza']);
      expect(result.valid).toBe(false);
      if (!result.valid) {
        expect(result.code).toBe('DUAL_MUNICIPAL_TAGS');
        expect(result.error).toContain('vis');
        expect(result.error).toContain('komiza');
      }
    });

    it('should allow empty tags', () => {
      const result = validateDualMunicipalTags([]);
      expect(result.valid).toBe(true);
    });
  });
});

describe('Municipal Notice Authorization', () => {
  describe('checkMunicipalNoticeAuth', () => {
    describe('non-municipal messages', () => {
      it('should allow admin with null scope to edit non-municipal message', () => {
        const result = checkMunicipalNoticeAuth(null, ['opcenito']);
        expect(result.allowed).toBe(true);
      });

      it('should allow admin with vis scope to edit non-municipal message', () => {
        const result = checkMunicipalNoticeAuth('vis', ['promet', 'hitno']);
        expect(result.allowed).toBe(true);
      });

      it('should allow admin with komiza scope to edit non-municipal message', () => {
        const result = checkMunicipalNoticeAuth('komiza', ['kultura']);
        expect(result.allowed).toBe(true);
      });
    });

    describe('vis municipal notices', () => {
      it('should allow admin with vis scope to edit vis notice', () => {
        const result = checkMunicipalNoticeAuth('vis', ['vis']);
        expect(result.allowed).toBe(true);
      });

      it('should deny admin with komiza scope from editing vis notice', () => {
        const result = checkMunicipalNoticeAuth('komiza', ['vis']);
        expect(result.allowed).toBe(false);
        if (!result.allowed) {
          expect(result.code).toBe('MUNICIPALITY_SCOPE_MISMATCH');
        }
      });

      it('should deny admin with null scope from editing vis notice', () => {
        const result = checkMunicipalNoticeAuth(null, ['vis']);
        expect(result.allowed).toBe(false);
        if (!result.allowed) {
          expect(result.code).toBe('NO_MUNICIPAL_NOTICE_SCOPE');
        }
      });

      it('should allow admin with vis scope to edit vis + hitno notice', () => {
        const result = checkMunicipalNoticeAuth('vis', ['vis', 'hitno']);
        expect(result.allowed).toBe(true);
      });
    });

    describe('komiza municipal notices', () => {
      it('should allow admin with komiza scope to edit komiza notice', () => {
        const result = checkMunicipalNoticeAuth('komiza', ['komiza']);
        expect(result.allowed).toBe(true);
      });

      it('should deny admin with vis scope from editing komiza notice', () => {
        const result = checkMunicipalNoticeAuth('vis', ['komiza']);
        expect(result.allowed).toBe(false);
        if (!result.allowed) {
          expect(result.code).toBe('MUNICIPALITY_SCOPE_MISMATCH');
        }
      });

      it('should deny admin with null scope from editing komiza notice', () => {
        const result = checkMunicipalNoticeAuth(null, ['komiza']);
        expect(result.allowed).toBe(false);
        if (!result.allowed) {
          expect(result.code).toBe('NO_MUNICIPAL_NOTICE_SCOPE');
        }
      });
    });

    describe('breakglass bypass', () => {
      it('should allow breakglass admin with null scope to edit vis notice', () => {
        const result = checkMunicipalNoticeAuth(null, ['vis'], true);
        expect(result.allowed).toBe(true);
      });

      it('should allow breakglass admin with null scope to edit komiza notice', () => {
        const result = checkMunicipalNoticeAuth(null, ['komiza'], true);
        expect(result.allowed).toBe(true);
      });

      it('should allow breakglass admin with vis scope to edit komiza notice', () => {
        const result = checkMunicipalNoticeAuth('vis', ['komiza'], true);
        expect(result.allowed).toBe(true);
      });

      it('should allow breakglass admin with komiza scope to edit vis notice', () => {
        const result = checkMunicipalNoticeAuth('komiza', ['vis'], true);
        expect(result.allowed).toBe(true);
      });

      it('should allow breakglass admin to edit non-municipal message', () => {
        const result = checkMunicipalNoticeAuth(null, ['opcenito'], true);
        expect(result.allowed).toBe(true);
      });
    });

    describe('error messages', () => {
      it('should return Croatian error for no scope', () => {
        const result = checkMunicipalNoticeAuth(null, ['vis']);
        if (!result.allowed) {
          expect(result.reason).toBeDefined();
          expect(result.reason).toContain('ovlasti');
        }
      });

      it('should include municipality name in mismatch error', () => {
        const result = checkMunicipalNoticeAuth('vis', ['komiza']);
        if (!result.allowed) {
          expect(result.reason).toBeDefined();
          expect(result.reason).toContain('Komiža');
        }
      });
    });

    /**
     * Archive/Restore Authorization Tests
     *
     * The same authorization rules apply to all operations:
     * - create, update, delete (archive), restore
     *
     * These tests explicitly document archive/restore scenarios.
     */
    describe('archive operation authorization', () => {
      it('should allow admin to archive non-municipal message', () => {
        const result = checkMunicipalNoticeAuth('vis', ['opcenito']);
        expect(result.allowed).toBe(true);
      });

      it('should allow admin with matching scope to archive municipal message', () => {
        // Admin with vis scope can archive vis message
        const result = checkMunicipalNoticeAuth('vis', ['vis']);
        expect(result.allowed).toBe(true);
      });

      it('should deny admin from archiving municipal message outside scope', () => {
        // Admin with vis scope cannot archive komiza message
        const result = checkMunicipalNoticeAuth('vis', ['komiza']);
        expect(result.allowed).toBe(false);
      });

      it('should deny admin with null scope from archiving municipal message', () => {
        const result = checkMunicipalNoticeAuth(null, ['vis']);
        expect(result.allowed).toBe(false);
      });
    });

    describe('restore operation authorization', () => {
      it('should allow admin to restore non-municipal message', () => {
        const result = checkMunicipalNoticeAuth('komiza', ['promet']);
        expect(result.allowed).toBe(true);
      });

      it('should allow admin with matching scope to restore municipal message', () => {
        // Admin with komiza scope can restore komiza message
        const result = checkMunicipalNoticeAuth('komiza', ['komiza']);
        expect(result.allowed).toBe(true);
      });

      it('should deny admin from restoring municipal message outside scope', () => {
        // Admin with komiza scope cannot restore vis message
        const result = checkMunicipalNoticeAuth('komiza', ['vis']);
        expect(result.allowed).toBe(false);
      });

      it('should deny admin with null scope from restoring municipal message', () => {
        const result = checkMunicipalNoticeAuth(null, ['komiza']);
        expect(result.allowed).toBe(false);
      });

      it('should allow breakglass admin to restore any municipal message', () => {
        // Breakglass can restore vis even with komiza scope
        const result1 = checkMunicipalNoticeAuth('komiza', ['vis'], true);
        expect(result1.allowed).toBe(true);

        // Breakglass can restore komiza even with null scope
        const result2 = checkMunicipalNoticeAuth(null, ['komiza'], true);
        expect(result2.allowed).toBe(true);
      });
    });
  });
});
