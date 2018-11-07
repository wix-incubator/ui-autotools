# Contributing to Schema extract

If you have any improvements, encountered any issues or types that we don't support, please let us know. We are happy to accept pull requests and issues, and hope to have a fruitful discussion.

#### Adding your own tests
We strongly believe in testing, and before we add a new feature or fix an issue, we first try to create a test for it.  
You can find all of our tests in the `test` folder, and they are pretty straightforward, you simply write your code as a string and the expected result as an object and we compare the result to the expected object:

```
    it('should flatten generic type definition', async () => {
        const fileName = 'index.ts';
        const res = await linkTest({[fileName]: `
        export type MyType<T, W> = {
            something:W;
            someone: T;
        };
        export type B = MyType<string, number>;
        `}, 'B', fileName);

        const expected: Schema<'object'> = {
            type: 'object',
            definedAt: '#MyType',
            properties: {
                something: {
                    type: 'number'
                },
                someone: {
                    type: 'string'
                }
            },
            required: ['something', 'someone']
        };
        expect(res).to.eql(expected);
    });
```

To run the tests, simply go to the `ui-autotools` folder and run `yarn start`. A new browser window will open and it will display all the tests.

## TS Transformer
Whether this is an issue or a new feature, we recommend that you first create a test to understand what the expected result should look like.  
After creating a test, the TS transformer's entry point is the `transform` function in [file-transformer](src/file-transformer.ts). It is somewhat built like a decision tree, a series of `if` statements followed by handling the chosen case.  

## Linker
Same as TS Transformer contribution, we recommend adding a new test to understand what the expected result should look like.  
The linker's entry point is the `flatten` method in [file-linker](src/file-linker.ts), followed by the `link` method that chooses the correct handler to handle this type.  