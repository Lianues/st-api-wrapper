# regexScript.process

## 描述

使用酒馆默认的正则是处理文本，模拟特定的位置注入。

## 输入

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| text | string | 要处理的文本。 |
| placement | number | 处理位置 (1:输入, 2:输出, 5:世界书等)。 |

## 输出

- `text`: `string` 处理后的文本。
