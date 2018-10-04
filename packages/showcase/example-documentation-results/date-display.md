# button example documentation:

## source code:

date-display.tsx
```tsx
import style from './date-display.st.css';
import { DateFormatter, defaultDateFormatter  }  from './date-fomatter'
export interface DateDisplayProps{
    /***
     * the date in iso number format
     * */
    value:number;
    formater?: DateFormatter
}

export class DateDisplay extends React.Component<DateDisplayProps>{
    /**
     * dates are expected in iso format
     * speed is defined as d/s :) 
     **/
    initCountDown(fromDate: number, toDate: number, speed: number = 1){

    }
}
```

date-display.st.css
```css
:import{
    -st-from: './component/button.st.css';
    -st-default: Button;
}

.root{

}

.day{
    -st-extends: input;
    --st-states: weekend, weekdays(enum( sun, mon, ...)) sun;
}

.month{
    -st-extends: input;

}

.year{
    -st-extends: input;

}

.clicker{
    -st-extends: Button;

}
```



date-display.meta.ts
```tsx
import * as React from 'react';
import Registry from '@ui-autotools/registry';
import {DateDisplay} from './date-display';
import style1 from './variant1.st.css';
import style2 from './variant2.st.css';

const metadata = Registry.getComponentMetadata(DateDisplay);

metadata.exportedFrom({
  path: 'src/date-display',
  exportName: 'DateDisplay',
  baseStylePath: 'src/date-display/date-display.st.css'
});

metadata.addSim({
  title: 'invalid date',
  props: {
    value: -5
  }
});

metadata.addExample('date display with drop down',()=>{
    return <div>
        <GenericDropDown target={(listener)=>{
            return <DateDisplay onClick={listener} value={5}></DateDisplay>
        }}>
            doomsday is near!
        </GenericDropDown>
    </div>
});


metadata.addDoc('./docs/date-display.md');

metadata.addStyle(style1, {name: 'style1', path: 'src/date-display/variant1.st.css'});
metadata.addStyle(style2, {name: 'style2', path: 'src/date-display/variant2.st.css'});

```


## resulting md:

### component API

## Props 

type: DateDisplayProps
| Name | Type | Default value| is optional | description |
| - | -| - | - | - |
| value | number | - | false | the date in isso number format
| formatter | #DateFormatter | #defaultDateFormater | true | -

## Methods

### initCountDown

dates are expected in iso format

speed is defined as d/s :) 


arguments
| Name | Type | Default value| is optional | description |
| - | -| - | - | - |
| fromDate | number | - | false | -
| toDate | number | - | false | -
| speed | number | 1 | true | -


### style API

| Part | Type | States| 
| - | -| - | - | - |
| root | html-element | -
| ::day | html-input | :weekend :weekday( sun / mon ...
| ::month | html-input |  -
| ::year | html-input |  -
| ::clicker | #Button |  -


example style api schema:

```json
{
    "$schema": "http://json-schema.org/draft-06/schema#",
    "$id": "src/...date-display.st.css",
    "$ref":"stylable/module",
    "properties":{
        "root":{
            "$ref":"stylable/html-element"
        },
        "day":{
            "$ref":"stylable/html-input",
            "states":{
                "weekend":{
                    "type":"boolean"
                },
                "weekdays":{
                    "type":"string",
                    "enum":[
                        "sun",
                        "mon",
                        "..."
                    ],
                    "default":"sun"
                }
            }
        },
        "month":{
            "$ref":"stylable/html-input"
        },
        "year":{
            "$ref":"stylable/html-input"
        },
        "clicker":{
            "$ref":"src/components/button.st.css"
        }

    }
}
```