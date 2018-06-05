import * as ts from 'typescript';
import * as path from 'path';
import { transform } from '../src/file-transformer';
import {expect} from 'chai';
const testNames = [['primitive-types','main']];
const testPaths = testNames.map((testName)=>path.join(__dirname,'fixtures',...testName));
const tsFilePaths = testPaths.map((testName)=>path.resolve(testName+'.ts'));
const jsonFilePaths = testNames.map((testName)=>'./fixtures/'+testName.join('/')+'.json');
describe('schema-extrct',()=>{
    let prg:ts.Program;
    let chckr:ts.TypeChecker;
    before(()=>{
        prg = ts.createProgram(tsFilePaths,{});
        chckr = prg.getTypeChecker();
    });
    
    
    for(var testIdx in testNames){
        it('should transform '+tsFilePaths[testIdx], async ()=>{
            const expected = await import(jsonFilePaths[testIdx]);
            expect(transform(chckr,prg.getSourceFile(tsFilePaths[testIdx])!)).to.eql(expected)
        })
    }
})

