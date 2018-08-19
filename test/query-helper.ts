import { suite , test , timeout } from 'mocha-typescript';
import * as query from '../lib/query-helper';
import * as assert from 'assert';

@suite class QueryHelper {
    @test arrayify() {
        let q = 'select * from test where a = $a and b = $b';
        let a = { a : 1 , b : 2 }
        let [ stmt , args ] = query.arrayify(q, a);
        assert.equal(stmt, 'select * from test where a = ? and b = ?')
        assert.deepEqual(args, [ 1 , 2 ])
    }

    @test escapeString() {
        let input = `what's your name - what's up?`;
        let expected = `'what\\'s your name - what\\'s up?'`;
        assert.equal(query.escape(input), expected)
    }

    @test escapeDate() {
        let input = new Date('2018-01-01T00:00:00.000Z')
        let expected = `'2018-01-01T00:00:00.000Z'`
        assert.equal(query.escape(input), expected)
    }

    @test escapeNumber() {
        let input = 15
        let expected = `15`
        assert.equal(query.escape(input), expected)
    }

    @test escapeBoolean() {
        let input = true
        let expected = `true`
        assert.equal(query.escape(input), expected)
    }
}
